package com.desk2dine.repository;

import com.desk2dine.entity.Order;
import com.desk2dine.entity.OrderStatus;
import com.desk2dine.exception.DatabaseOperationException;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * JDBC repository for the `orders` table. Two connection-handling
 * styles are used deliberately:
 *   - Methods that take a Connection parameter (insert, findByIdForUpdate,
 *     markDelivered, markReceived, markBilled, markPaid, markCompleted,
 *     nextBillNumber) participate in a transaction started by the caller
 *     (OrderService), so an order's status change and its related
 *     payments/notifications rows commit or roll back together.
 *   - Methods that manage their own Connection (findById, search,
 *     countSearch) are simple read-only lookups that don't need to join
 *     a wider transaction.
 */
@Repository
public class OrderRepository {

    private final DataSource dataSource;

    public OrderRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Order insert(Connection connection, Order order) {
        String sql = "INSERT INTO orders (user_id, delivery_location_id, status, total_amount) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setLong(1, order.getUserId());
            ps.setLong(2, order.getDeliveryLocationId());
            ps.setString(3, order.getStatus().name());
            ps.setBigDecimal(4, order.getTotalAmount());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) order.setId(keys.getLong(1));
            }
            return order;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to place order", e);
        }
    }

    /**
     * Locks the order row for the duration of the current transaction
     * (SELECT ... FOR UPDATE) so two concurrent requests (e.g. staff
     * double-clicking "Generate Bill") can't both act on the same
     * stale status.
     */
    public Optional<Order> findByIdForUpdate(Connection connection, Long id) {
        String sql = "SELECT * FROM orders WHERE id = ? FOR UPDATE";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapBasicRow(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to load order", e);
        }
    }

    /** Atomically hands out the next bill number using a single-row counter table. */
    public Long nextBillNumber(Connection connection) {
        try (PreparedStatement update = connection.prepareStatement(
                "UPDATE bill_number_sequence SET last_value = LAST_INSERT_ID(last_value + 1) WHERE id = 1")) {
            update.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to allocate bill number", e);
        }
        try (PreparedStatement select = connection.prepareStatement("SELECT LAST_INSERT_ID()");
             ResultSet rs = select.executeQuery()) {
            if (rs.next()) return rs.getLong(1);
            throw new DatabaseOperationException("Failed to read allocated bill number", null);
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to read allocated bill number", e);
        }
    }

    public boolean markDelivered(Connection connection, Long id) {
        return transition(connection, id, OrderStatus.PLACED, OrderStatus.DELIVERED, "delivered_time", null);
    }

    public boolean markReceived(Connection connection, Long id) {
        return transition(connection, id, OrderStatus.DELIVERED, OrderStatus.RECEIVED, "received_time", null);
    }

    public boolean markBilled(Connection connection, Long id, Long billNumber) {
        String sql = "UPDATE orders SET status = ?, billed_time = NOW(), bill_number = ? WHERE id = ? AND status = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, OrderStatus.BILLED.name());
            ps.setLong(2, billNumber);
            ps.setLong(3, id);
            ps.setString(4, OrderStatus.RECEIVED.name());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to record bill", e);
        }
    }

    public boolean markPaid(Connection connection, Long id) {
        return transition(connection, id, OrderStatus.BILLED, OrderStatus.PAID, "paid_time", null);
    }

    public boolean markCompleted(Connection connection, Long id) {
        return transition(connection, id, OrderStatus.PAID, OrderStatus.COMPLETED, "completed_time", null);
    }

    private boolean transition(Connection connection, Long id, OrderStatus from, OrderStatus to,
                                String timeColumn, String unusedReserved) {
        // timeColumn is always one of our own hard-coded constants above, never user input,
        // so building the column name into the SQL text here does not create an injection risk.
        String sql = "UPDATE orders SET status = ?, " + timeColumn + " = NOW() WHERE id = ? AND status = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, to.name());
            ps.setLong(2, id);
            ps.setString(3, from.name());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to update order status", e);
        }
    }

    public Optional<Order> findById(Long id) {
        String sql = baseSelect() + " WHERE o.id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to load order", e);
        }
    }

    /**
     * Search + filter + paginate orders. Used by both "My Orders" (pass
     * userId) and the staff/admin dashboard (userId = null, sees everyone).
     */
    public List<Order> search(Long userId, OrderStatus statusFilter, int page, int size) {
        StringBuilder sql = new StringBuilder(baseSelect()).append(" WHERE 1=1 ");
        List<Object> params = new ArrayList<>();
        if (userId != null) {
            sql.append("AND o.user_id = ? ");
            params.add(userId);
        }
        if (statusFilter != null) {
            sql.append("AND o.status = ? ");
            params.add(statusFilter.name());
        }
        sql.append("ORDER BY o.order_time DESC LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) ps.setObject(i + 1, params.get(i));
            List<Order> orders = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) orders.add(mapRow(rs));
            }
            return orders;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to search orders", e);
        }
    }

    public long countSearch(Long userId, OrderStatus statusFilter) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM orders o WHERE 1=1 ");
        List<Object> params = new ArrayList<>();
        if (userId != null) {
            sql.append("AND o.user_id = ? ");
            params.add(userId);
        }
        if (statusFilter != null) {
            sql.append("AND o.status = ? ");
            params.add(statusFilter.name());
        }
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) ps.setObject(i + 1, params.get(i));
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getLong(1) : 0;
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to count orders", e);
        }
    }

    private String baseSelect() {
        return "SELECT o.*, u.full_name AS faculty_name, dl.name AS location_name " +
                "FROM orders o " +
                "JOIN users u ON u.id = o.user_id " +
                "JOIN delivery_locations dl ON dl.id = o.delivery_location_id";
    }

    /** Maps only the orders table's own columns — used inside the locked read where joins aren't needed. */
    private Order mapBasicRow(ResultSet rs) throws SQLException {
        Order order = new Order();
        order.setId(rs.getLong("id"));
        order.setUserId(rs.getLong("user_id"));
        order.setDeliveryLocationId(rs.getLong("delivery_location_id"));
        order.setStatus(OrderStatus.valueOf(rs.getString("status")));
        order.setTotalAmount(rs.getBigDecimal("total_amount"));
        long billNumber = rs.getLong("bill_number");
        if (!rs.wasNull()) order.setBillNumber(billNumber);
        order.setOrderTime(toLocalDateTime(rs, "order_time"));
        order.setDeliveredTime(toLocalDateTime(rs, "delivered_time"));
        order.setReceivedTime(toLocalDateTime(rs, "received_time"));
        order.setBilledTime(toLocalDateTime(rs, "billed_time"));
        order.setPaidTime(toLocalDateTime(rs, "paid_time"));
        order.setCompletedTime(toLocalDateTime(rs, "completed_time"));
        return order;
    }

    private Order mapRow(ResultSet rs) throws SQLException {
        Order order = mapBasicRow(rs);
        order.setFacultyName(rs.getString("faculty_name"));
        order.setDeliveryLocationName(rs.getString("location_name"));
        return order;
    }

    private java.time.LocalDateTime toLocalDateTime(ResultSet rs, String column) throws SQLException {
        Timestamp ts = rs.getTimestamp(column);
        return ts == null ? null : ts.toLocalDateTime();
    }
}
