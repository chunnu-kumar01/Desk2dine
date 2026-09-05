package com.desk2dine.service;

import com.desk2dine.dto.CreateOrderRequest;
import com.desk2dine.dto.OrderItemRequest;
import com.desk2dine.dto.PageResult;
import com.desk2dine.entity.*;
import com.desk2dine.exception.DatabaseOperationException;
import com.desk2dine.exception.ForbiddenException;
import com.desk2dine.exception.NotFoundException;
import com.desk2dine.exception.ValidationException;
import com.desk2dine.repository.*;
import com.desk2dine.security.Role;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * The transactional heart of the app. Every state transition
 * (PLACED -> DELIVERED -> RECEIVED -> BILLED -> PAID -> COMPLETED) is
 * implemented here as: open one JDBC Connection, lock the order row
 * with SELECT ... FOR UPDATE, verify the current status is the expected
 * "from" state, make every related write (order status, payment row,
 * notification row) using that SAME connection, then commit — or roll
 * every bit of it back on any failure.
 *
 * Data flow for "Place Order" (frontend -> ... -> MySQL -> frontend):
 *   1. faculty.html's quantity steppers build a JSON body
 *      {deliveryLocationId, items:[{menuItemId, quantity}, ...]}.
 *   2. OrderController#placeOrder validates it's well-formed
 *      (CreateOrderRequest + @Valid) and reads the caller's user id out
 *      of the session (never trusts a userId from the request body).
 *   3. OrderController calls OrderService#placeOrder(userId, request).
 *   4. This method re-prices every line item from menu_items (never
 *      trusts a price from the browser), opens a transaction, inserts
 *      one orders row and N order_items rows, commits, and writes an
 *      audit log row.
 *   5. It returns a fully-populated Order (with items + faculty name +
 *      location name from JOINs) which the controller wraps in
 *      ApiResponse.ok(...) and the browser renders on order-details.html.
 */
@Service
public class OrderService {

    private final DataSource dataSource;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final DeliveryLocationRepository deliveryLocationRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public OrderService(DataSource dataSource, OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                         MenuItemRepository menuItemRepository, DeliveryLocationRepository deliveryLocationRepository,
                         PaymentRepository paymentRepository, NotificationService notificationService,
                         AuditLogService auditLogService) {
        this.dataSource = dataSource;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.deliveryLocationRepository = deliveryLocationRepository;
        this.paymentRepository = paymentRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    public Order placeOrder(Long userId, CreateOrderRequest request) {
        deliveryLocationRepository.findById(request.getDeliveryLocationId())
                .orElseThrow(() -> new ValidationException("Selected delivery location does not exist"));

        // Re-price every item from the database — the client only sends menuItemId + quantity,
        // never a price, so there is no way for a tampered request to change the bill.
        List<OrderItem> lineItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest req : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(req.getMenuItemId())
                    .orElseThrow(() -> new ValidationException("One of the selected menu items no longer exists"));
            if (!menuItem.isAvailable()) {
                throw new ValidationException(menuItem.getName() + " is currently unavailable");
            }
            OrderItem line = new OrderItem();
            line.setMenuItemId(menuItem.getId());
            line.setItemName(menuItem.getName());
            line.setUnitPrice(menuItem.getPrice());
            line.setQuantity(req.getQuantity());
            BigDecimal amount = menuItem.getPrice().multiply(BigDecimal.valueOf(req.getQuantity()));
            line.setAmount(amount);
            total = total.add(amount);
            lineItems.add(line);
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setDeliveryLocationId(request.getDeliveryLocationId());
        order.setStatus(OrderStatus.PLACED);
        order.setTotalAmount(total);

        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try {
                orderRepository.insert(connection, order);
                for (OrderItem line : lineItems) {
                    orderItemRepository.insert(connection, order.getId(), line);
                }
                connection.commit();
            } catch (RuntimeException e) {
                connection.rollback();
                throw e;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to place order", e);
        }

        auditLogService.record(userId, "ORDER_PLACED", "ORDER", order.getId(),
                "Order placed for " + formatMoney(total));

        return getOrderDetail(order.getId(), userId, Role.FACULTY);
    }

    public Order markDelivered(Long orderId, Long actingUserId) {
        return transitionWithNotification(orderId, actingUserId, Role.ADMIN, OrderStatus.PLACED,
                (connection, order) -> {
                    boolean updated = orderRepository.markDelivered(connection, orderId);
                    if (!updated) throw new IllegalStateException("Order is not in PLACED status");
                    notificationService.create(connection, order.getUserId(), "Order delivered",
                            "Your order #" + orderId + " has been delivered. Please confirm you received it.");
                }, "ORDER_DELIVERED");
    }

    public Order markReceived(Long orderId, Long actingUserId, Role actingRole) {
        return transitionWithNotification(orderId, actingUserId, actingRole, OrderStatus.DELIVERED,
                (connection, order) -> {
                    enforceOwnership(order, actingUserId, actingRole);
                    boolean updated = orderRepository.markReceived(connection, orderId);
                    if (!updated) throw new IllegalStateException("Order is not in DELIVERED status");
                }, "ORDER_RECEIVED");
    }

    public Order generateBill(Long orderId, Long actingUserId) {
        return transitionWithNotification(orderId, actingUserId, Role.ADMIN, OrderStatus.RECEIVED,
                (connection, order) -> {
                    Long billNumber = orderRepository.nextBillNumber(connection);
                    boolean updated = orderRepository.markBilled(connection, orderId, billNumber);
                    if (!updated) throw new IllegalStateException("Order is not in RECEIVED status");

                    Payment payment = new Payment();
                    payment.setOrderId(orderId);
                    payment.setBillNumber(billNumber);
                    payment.setAmount(order.getTotalAmount());
                    payment.setPaymentMethod("CASH");
                    payment.setPaymentStatus("PENDING");
                    paymentRepository.insert(connection, payment);

                    notificationService.create(connection, order.getUserId(), "Bill generated",
                            "Bill #" + billNumber + " for " + formatMoney(order.getTotalAmount()) +
                                    " is ready. Please pay at the counter.");
                }, "ORDER_BILLED");
    }

    public Order markPaid(Long orderId, Long actingUserId, Role actingRole) {
        return transitionWithNotification(orderId, actingUserId, actingRole, OrderStatus.BILLED,
                (connection, order) -> {
                    enforceOwnership(order, actingUserId, actingRole);
                    boolean updated = orderRepository.markPaid(connection, orderId);
                    if (!updated) throw new IllegalStateException("Order is not in BILLED status");
                    paymentRepository.markPaid(connection, orderId);
                }, "ORDER_PAID");
    }

    public Order markCompleted(Long orderId, Long actingUserId) {
        return transitionWithNotification(orderId, actingUserId, Role.ADMIN, OrderStatus.PAID,
                (connection, order) -> {
                    boolean updated = orderRepository.markCompleted(connection, orderId);
                    if (!updated) throw new IllegalStateException("Order is not in PAID status");
                    notificationService.create(connection, order.getUserId(), "Order completed",
                            "Order #" + orderId + " is complete. Thanks for ordering with Desk2Dine!");
                }, "ORDER_COMPLETED");
    }

    /**
     * Shared skeleton for every lifecycle transition: open a transaction,
     * lock the order row, run the transition-specific work, commit, then
     * audit-log and return the refreshed order outside the transaction.
     */
    private Order transitionWithNotification(Long orderId, Long actingUserId, Role actingRole,
                                              OrderStatus expectedFrom, TransitionWork work, String auditAction) {
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try {
                Order locked = orderRepository.findByIdForUpdate(connection, orderId)
                        .orElseThrow(() -> new NotFoundException("Order not found"));
                if (locked.getStatus() != expectedFrom) {
                    throw new IllegalStateException(
                            "Order #" + orderId + " is in status " + locked.getStatus() +
                                    " — expected " + expectedFrom + " for this action.");
                }
                work.run(connection, locked);
                connection.commit();
            } catch (RuntimeException e) {
                connection.rollback();
                throw e;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to update order", e);
        }

        auditLogService.record(actingUserId, auditAction, "ORDER", orderId, "Status transition");
        return getOrderDetail(orderId, actingUserId, Role.ADMIN);
    }

    @FunctionalInterface
    private interface TransitionWork {
        void run(Connection connection, Order order) throws SQLException;
    }

    public Order getOrderDetail(Long orderId, Long callerUserId, Role callerRole) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        enforceOwnership(order, callerUserId, callerRole);
        order.setItems(orderItemRepository.findByOrderId(orderId));
        return order;
    }

    public PageResult<Order> listMyOrders(Long userId, OrderStatus statusFilter, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 50);
        List<Order> orders = orderRepository.search(userId, statusFilter, safePage, safeSize);
        attachItems(orders);
        long total = orderRepository.countSearch(userId, statusFilter);
        return new PageResult<>(orders, safePage, safeSize, total);
    }

    public PageResult<Order> listAllOrders(OrderStatus statusFilter, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 50);
        List<Order> orders = orderRepository.search(null, statusFilter, safePage, safeSize);
        attachItems(orders);
        long total = orderRepository.countSearch(null, statusFilter);
        return new PageResult<>(orders, safePage, safeSize, total);
    }

    private void attachItems(List<Order> orders) {
        if (orders.isEmpty()) return;
        List<Long> ids = orders.stream().map(Order::getId).collect(Collectors.toList());
        List<OrderItem> allItems = orderItemRepository.findByOrderIds(ids);
        Map<Long, List<OrderItem>> byOrder = allItems.stream()
                .collect(Collectors.groupingBy(OrderItem::getOrderId));
        for (Order order : orders) {
            order.setItems(byOrder.getOrDefault(order.getId(), List.of()));
        }
    }

    /** Faculty may only act on their own orders; Admin can act on any order. */
    private void enforceOwnership(Order order, Long callerUserId, Role callerRole) {
        if (callerRole == Role.FACULTY && !order.getUserId().equals(callerUserId)) {
            throw new ForbiddenException("You can only manage your own orders");
        }
    }

    private String formatMoney(BigDecimal amount) {
        return "\u20B9" + amount.setScale(2, java.math.RoundingMode.HALF_UP);
    }
}
