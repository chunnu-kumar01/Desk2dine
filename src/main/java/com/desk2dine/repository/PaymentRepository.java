package com.desk2dine.repository;

import com.desk2dine.entity.Payment;
import com.desk2dine.exception.DatabaseOperationException;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.Optional;

/**
 * JDBC repository for `payments`. A payment row is created (status
 * PENDING) in the same transaction as OrderRepository#markBilled, and
 * flipped to PAID in the same transaction as OrderRepository#markPaid —
 * see OrderService#generateBill / #markPaid.
 */
@Repository
public class PaymentRepository {

    private final DataSource dataSource;

    public PaymentRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void insert(Connection connection, Payment payment) {
        String sql = "INSERT INTO payments (order_id, bill_number, amount, payment_method, payment_status) " +
                "VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, payment.getOrderId());
            ps.setLong(2, payment.getBillNumber());
            ps.setBigDecimal(3, payment.getAmount());
            ps.setString(4, payment.getPaymentMethod());
            ps.setString(5, payment.getPaymentStatus());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to create payment record", e);
        }
    }

    public void markPaid(Connection connection, Long orderId) {
        String sql = "UPDATE payments SET payment_status = 'PAID', paid_at = NOW() WHERE order_id = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, orderId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to mark payment as paid", e);
        }
    }

    public Optional<Payment> findByOrderId(Long orderId) {
        String sql = "SELECT * FROM payments WHERE order_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, orderId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to load payment", e);
        }
    }

    private Payment mapRow(ResultSet rs) throws SQLException {
        Payment payment = new Payment();
        payment.setId(rs.getLong("id"));
        payment.setOrderId(rs.getLong("order_id"));
        payment.setBillNumber(rs.getLong("bill_number"));
        payment.setAmount(rs.getBigDecimal("amount"));
        payment.setPaymentMethod(rs.getString("payment_method"));
        payment.setPaymentStatus(rs.getString("payment_status"));
        Timestamp paidAt = rs.getTimestamp("paid_at");
        if (paidAt != null) payment.setPaidAt(paidAt.toLocalDateTime());
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) payment.setCreatedAt(createdAt.toLocalDateTime());
        return payment;
    }
}
