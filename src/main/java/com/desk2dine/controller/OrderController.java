package com.desk2dine.controller;

import com.desk2dine.dto.CreateOrderRequest;
import com.desk2dine.dto.PageResult;
import com.desk2dine.entity.Order;
import com.desk2dine.entity.OrderStatus;
import com.desk2dine.security.Role;
import com.desk2dine.security.RequireRole;
import com.desk2dine.service.OrderService;
import com.desk2dine.util.ApiResponse;
import com.desk2dine.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/**
 * Every order-related HTTP endpoint. Notice that userId is always read
 * from the session (SessionUtil.getCurrentUserId), never trusted from
 * the request body or a query parameter — that's what stops a faculty
 * member from placing an order "as" someone else, or viewing another
 * user's order history by guessing an id.
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** Faculty: place a new order. */
    @PostMapping
    public ApiResponse<Order> placeOrder(@Valid @RequestBody CreateOrderRequest request, HttpServletRequest httpRequest) {
        Long userId = SessionUtil.getCurrentUserId(httpRequest);
        return ApiResponse.ok("Order placed", orderService.placeOrder(userId, request));
    }

    /** Faculty: paginated list of the caller's own orders, optionally filtered by status. */
    @GetMapping("/mine")
    public ApiResponse<PageResult<Order>> myOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest httpRequest) {
        Long userId = SessionUtil.getCurrentUserId(httpRequest);
        return ApiResponse.ok(orderService.listMyOrders(userId, status, page, size));
    }

    /** Admin/staff: paginated list of every order, optionally filtered by status. */
    @GetMapping
    @RequireRole(Role.ADMIN)
    public ApiResponse<PageResult<Order>> allOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(orderService.listAllOrders(status, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<Order> getOne(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long userId = SessionUtil.getCurrentUserId(httpRequest);
        Role role = SessionUtil.getCurrentRole(httpRequest);
        return ApiResponse.ok(orderService.getOrderDetail(id, userId, role));
    }

    /** Admin/staff: PLACED -> DELIVERED. */
    @PatchMapping("/{id}/deliver")
    @RequireRole(Role.ADMIN)
    public ApiResponse<Order> deliver(@PathVariable Long id, HttpServletRequest httpRequest) {
        return ApiResponse.ok("Marked as delivered", orderService.markDelivered(id, SessionUtil.getCurrentUserId(httpRequest)));
    }

    /** Faculty: DELIVERED -> RECEIVED (only the owning faculty member). */
    @PatchMapping("/{id}/receive")
    public ApiResponse<Order> receive(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long userId = SessionUtil.getCurrentUserId(httpRequest);
        Role role = SessionUtil.getCurrentRole(httpRequest);
        return ApiResponse.ok("Marked as received", orderService.markReceived(id, userId, role));
    }

    /** Admin/staff: RECEIVED -> BILLED (generates the bill number + payment record). */
    @PatchMapping("/{id}/bill")
    @RequireRole(Role.ADMIN)
    public ApiResponse<Order> generateBill(@PathVariable Long id, HttpServletRequest httpRequest) {
        return ApiResponse.ok("Bill generated", orderService.generateBill(id, SessionUtil.getCurrentUserId(httpRequest)));
    }

    /** Faculty: BILLED -> PAID (only the owning faculty member). */
    @PatchMapping("/{id}/pay")
    public ApiResponse<Order> pay(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long userId = SessionUtil.getCurrentUserId(httpRequest);
        Role role = SessionUtil.getCurrentRole(httpRequest);
        return ApiResponse.ok("Payment confirmed", orderService.markPaid(id, userId, role));
    }

    /** Admin/staff: PAID -> COMPLETED. */
    @PatchMapping("/{id}/complete")
    @RequireRole(Role.ADMIN)
    public ApiResponse<Order> complete(@PathVariable Long id, HttpServletRequest httpRequest) {
        return ApiResponse.ok("Order completed", orderService.markCompleted(id, SessionUtil.getCurrentUserId(httpRequest)));
    }
}
