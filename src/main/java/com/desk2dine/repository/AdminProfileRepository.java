package com.desk2dine.repository;

import com.desk2dine.entity.AdminProfile;
import com.desk2dine.exception.DatabaseOperationException;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * JDBC repository for the `admin` table (1-to-1 extension of `users`
 * for accounts with role = ADMIN). Same transaction-sharing pattern as
 * FacultyProfileRepository.
 */
@Repository
public class AdminProfileRepository {

    private final DataSource dataSource;

    public AdminProfileRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void insert(Connection connection, AdminProfile profile) {
        String sql = "INSERT INTO admin (user_id, admin_level) VALUES (?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, profile.getUserId());
            ps.setString(2, profile.getAdminLevel());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to create admin profile", e);
        }
    }
}
