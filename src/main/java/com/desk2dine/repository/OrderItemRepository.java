package com.desk2dine.repository;

import com.desk2dine.entity.OrderItem;
import com.desk2dine.exception.DatabaseOperationException;

import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * JDBC repository for `order_items`. insert() takes an externally
 * managed Connection so every line item is written in the same
 * transaction as its parent Order (see OrderService#placeOrder) — if
 * any line item fails to insert, the whole order is rolled back.
 */
@Repository
public class OrderItemRepository {

    private final DataSource dataSource;

    public OrderItemRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void insert(Connection connection, Long orderId, OrderItem item) {
        String sql = "INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity, amount) " +
                "VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, orderId);
            ps.setLong(2, item.getMenuItemId());
            ps.setString(3, item.getItemName());
            ps.setBigDecimal(4, item.getUnitPrice());
            ps.setInt(5, item.getQuantity());
            ps.setBigDecimal(6, item.getAmount());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to save order item", e);
        }
    }

    public List<OrderItem> findByOrderId(Long orderId) {
        String sql = "SELECT * FROM order_items WHERE order_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, orderId);
            List<OrderItem> items = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) items.add(mapRow(rs));
            }
            return items;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to load order items", e);
        }
    }

    /** Bulk-loads line items for many orders at once (avoids N+1 queries when listing orders). */
    public List<OrderItem> findByOrderIds(List<Long> orderIds) {
        if (orderIds.isEmpty()) return new ArrayList<>();
        String placeholders = String.join(",", orderIds.stream().map(id -> "?").toArray(String[]::new));
        String sql = "SELECT * FROM order_items WHERE order_id IN (" + placeholders + ")";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 0; i < orderIds.size(); i++) {
                ps.setLong(i + 1, orderIds.get(i));
            }
            List<OrderItem> items = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) items.add(mapRow(rs));
            }
            return items;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to load order items", e);
        }
    }

    private OrderItem mapRow(ResultSet rs) throws SQLException {
        OrderItem item = new OrderItem();
        item.setId(rs.getLong("id"));
        item.setOrderId(rs.getLong("order_id"));
        item.setMenuItemId(rs.getLong("menu_item_id"));
        item.setItemName(rs.getString("item_name"));
        item.setUnitPrice(rs.getBigDecimal("unit_price"));
        item.setQuantity(rs.getInt("quantity"));
        item.setAmount(rs.getBigDecimal("amount"));
        return item;
    }
}
