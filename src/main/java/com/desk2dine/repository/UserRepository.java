package com.desk2dine.repository;

import com.desk2dine.entity.User;
import com.desk2dine.exception.DatabaseOperationException;
import com.desk2dine.security.Role;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Every method here talks to the `users` table using nothing but
 * java.sql.Connection / PreparedStatement / ResultSet — no JPA, no
 * JdbcTemplate. PreparedStatement is used for every query (never string
 * concatenation), which is what actually prevents SQL injection.
 *
 * Called by: AuthService (signup, login, forgot/reset password),
 * ProfileService (view/update own profile), AdminUserService (list
 * users for the admin console).
 */
@Repository
public class UserRepository {

    private final DataSource dataSource;

    public UserRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Inserts a new user as part of an ongoing transaction (the caller —
     * AuthService#signup — also inserts a row into `faculty` or `admin`
     * in the same transaction, so both must succeed or both must roll
     * back together). The generated id is set back onto the User object.
     */
    public User insert(Connection connection, User user) {
        String sql = "INSERT INTO users (full_name, email, mobile_number, password_hash, role, is_active) " +
                "VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, user.getFullName());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getMobileNumber());
            ps.setString(4, user.getPasswordHash());
            ps.setString(5, user.getRole().name());
            ps.setBoolean(6, user.isActive());
            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    user.setId(keys.getLong(1));
                }
            }
            return user;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to create user account", e);
        }
    }

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to look up user by email", e);
        }
    }

    public Optional<User> findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to look up user by id", e);
        }
    }

    public boolean existsByEmail(String email) {
        String sql = "SELECT 1 FROM users WHERE email = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to check for existing email", e);
        }
    }

    public void updateProfile(Long userId, String fullName, String mobileNumber) {
        String sql = "UPDATE users SET full_name = ?, mobile_number = ? WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, fullName);
            ps.setString(2, mobileNumber);
            ps.setLong(3, userId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to update profile", e);
        }
    }

    public void updatePassword(Long userId, String newPasswordHash) {
        String sql = "UPDATE users SET password_hash = ? WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, newPasswordHash);
            ps.setLong(2, userId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to update password", e);
        }
    }

    public long countByRole(Role role) {
        String sql = "SELECT COUNT(*) FROM users WHERE role = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, role.name());
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getLong(1) : 0;
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to count users by role", e);
        }
    }

    /**
     * Search + paginate + sort over all users — powers the admin "Manage
     * Users" screen. Every dynamic piece (search text, role filter, sort
     * column) is still bound through PreparedStatement placeholders or
     * validated against a fixed allow-list (sortColumn) before being
     * concatenated, so this remains injection-safe.
     */
    public List<User> search(String searchText, Role roleFilter, String sortColumn, String sortDirection,
                              int page, int size) {
        String column = allowedSortColumn(sortColumn);
        String direction = "asc".equalsIgnoreCase(sortDirection) ? "ASC" : "DESC";

        StringBuilder sql = new StringBuilder("SELECT * FROM users WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (searchText != null && !searchText.isBlank()) {
            sql.append("AND (full_name LIKE ? OR email LIKE ?) ");
            String like = "%" + searchText.trim() + "%";
            params.add(like);
            params.add(like);
        }
        if (roleFilter != null) {
            sql.append("AND role = ? ");
            params.add(roleFilter.name());
        }
        sql.append("ORDER BY ").append(column).append(" ").append(direction).append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            List<User> results = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    results.add(mapRow(rs));
                }
            }
            return results;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to search users", e);
        }
    }

    public long countSearch(String searchText, Role roleFilter) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM users WHERE 1=1 ");
        List<Object> params = new ArrayList<>();
        if (searchText != null && !searchText.isBlank()) {
            sql.append("AND (full_name LIKE ? OR email LIKE ?) ");
            String like = "%" + searchText.trim() + "%";
            params.add(like);
            params.add(like);
        }
        if (roleFilter != null) {
            sql.append("AND role = ? ");
            params.add(roleFilter.name());
        }
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getLong(1) : 0;
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to count users", e);
        }
    }

    /** Only ever allow sorting by a fixed, known-safe set of columns. */
    private String allowedSortColumn(String requested) {
        if (requested == null) return "created_at";
        return switch (requested) {
            case "fullName" -> "full_name";
            case "email" -> "email";
            case "role" -> "role";
            default -> "created_at";
        };
    }

    private User mapRow(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setFullName(rs.getString("full_name"));
        user.setEmail(rs.getString("email"));
        user.setMobileNumber(rs.getString("mobile_number"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setRole(Role.valueOf(rs.getString("role")));
        user.setActive(rs.getBoolean("is_active"));
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) user.setCreatedAt(createdAt.toLocalDateTime());
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) user.setUpdatedAt(updatedAt.toLocalDateTime());
        return user;
    }
}
