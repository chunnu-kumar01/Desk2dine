package com.desk2dine.repository;

import com.desk2dine.entity.AuditLog;
import com.desk2dine.exception.DatabaseOperationException;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * JDBC repository for the append-only `audit_logs` table. AuditLogService
 * writes to this after security-sensitive actions (signup, login,
 * password change, order placed, status transitions). Only admins can
 * read it back (see AuditLogController + AuthInterceptor role check).
 */
@Repository
public class AuditLogRepository {

    private final DataSource dataSource;

    public AuditLogRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void insert(Long userId, String action, String entityType, Long entityId, String details) {
        String sql = "INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (userId != null) ps.setLong(1, userId); else ps.setNull(1, Types.BIGINT);
            ps.setString(2, action);
            ps.setString(3, entityType);
            if (entityId != null) ps.setLong(4, entityId); else ps.setNull(4, Types.BIGINT);
            ps.setString(5, details);
            ps.executeUpdate();
        } catch (SQLException e) {
            // Auditing must never break the primary action it's recording — log and swallow.
            System.err.println("Failed to write audit log: " + e.getMessage());
        }
    }

    public List<AuditLog> search(String actionFilter, int page, int size) {
        StringBuilder sql = new StringBuilder(
                "SELECT a.*, u.full_name AS user_name FROM audit_logs a " +
                        "LEFT JOIN users u ON u.id = a.user_id WHERE 1=1 ");
        List<Object> params = new ArrayList<>();
        if (actionFilter != null && !actionFilter.isBlank()) {
            sql.append("AND a.action = ? ");
            params.add(actionFilter);
        }
        sql.append("ORDER BY a.created_at DESC LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) ps.setObject(i + 1, params.get(i));
            List<AuditLog> logs = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) logs.add(mapRow(rs));
            }
            return logs;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to search audit logs", e);
        }
    }

    public long countSearch(String actionFilter) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM audit_logs WHERE 1=1 ");
        List<Object> params = new ArrayList<>();
        if (actionFilter != null && !actionFilter.isBlank()) {
            sql.append("AND action = ? ");
            params.add(actionFilter);
        }
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) ps.setObject(i + 1, params.get(i));
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getLong(1) : 0;
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to count audit logs", e);
        }
    }

    private AuditLog mapRow(ResultSet rs) throws SQLException {
        AuditLog log = new AuditLog();
        log.setId(rs.getLong("id"));
        long userId = rs.getLong("user_id");
        if (!rs.wasNull()) log.setUserId(userId);
        log.setUserName(rs.getString("user_name"));
        log.setAction(rs.getString("action"));
        log.setEntityType(rs.getString("entity_type"));
        long entityId = rs.getLong("entity_id");
        if (!rs.wasNull()) log.setEntityId(entityId);
        log.setDetails(rs.getString("details"));
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) log.setCreatedAt(createdAt.toLocalDateTime());
        return log;
    }
}
