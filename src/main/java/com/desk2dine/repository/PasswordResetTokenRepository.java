package com.desk2dine.repository;

import com.desk2dine.entity.PasswordResetToken;
import com.desk2dine.exception.DatabaseOperationException;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.Optional;

/**
 * JDBC repository for `password_reset_tokens`. Backs the forgot/reset
 * password flow: AuthService#forgotPassword creates a token here,
 * AuthService#resetPassword looks it up, validates it, then marks it
 * used so it cannot be replayed.
 */
@Repository
public class PasswordResetTokenRepository {

    private final DataSource dataSource;

    public PasswordResetTokenRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public PasswordResetToken insert(PasswordResetToken token) {
        String sql = "INSERT INTO password_reset_tokens (user_id, token, expires_at, used) VALUES (?, ?, ?, ?)";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setLong(1, token.getUserId());
            ps.setString(2, token.getToken());
            ps.setTimestamp(3, Timestamp.valueOf(token.getExpiresAt()));
            ps.setBoolean(4, token.isUsed());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) token.setId(keys.getLong(1));
            }
            return token;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to create password reset token", e);
        }
    }

    public Optional<PasswordResetToken> findByToken(String tokenValue) {
        String sql = "SELECT * FROM password_reset_tokens WHERE token = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, tokenValue);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to look up reset token", e);
        }
    }

    public void markUsed(Long id) {
        String sql = "UPDATE password_reset_tokens SET used = 1 WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to mark reset token used", e);
        }
    }

    private PasswordResetToken mapRow(ResultSet rs) throws SQLException {
        PasswordResetToken token = new PasswordResetToken();
        token.setId(rs.getLong("id"));
        token.setUserId(rs.getLong("user_id"));
        token.setToken(rs.getString("token"));
        token.setExpiresAt(rs.getTimestamp("expires_at").toLocalDateTime());
        token.setUsed(rs.getBoolean("used"));
        token.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return token;
    }
}
