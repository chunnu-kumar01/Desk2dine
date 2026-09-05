package com.desk2dine.repository;

import com.desk2dine.entity.FacultyProfile;
import com.desk2dine.exception.DatabaseOperationException;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * JDBC repository for the `faculty` table (1-to-1 extension of `users`
 * for accounts with role = FACULTY). insert() takes an externally
 * managed Connection so it can share a transaction with UserRepository
 * during signup — either both rows are written, or neither is.
 */
@Repository
public class FacultyProfileRepository {

    private final DataSource dataSource;

    public FacultyProfileRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void insert(Connection connection, FacultyProfile profile) {
        String sql = "INSERT INTO faculty (user_id, department, designation) VALUES (?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setLong(1, profile.getUserId());
            ps.setString(2, profile.getDepartment());
            ps.setString(3, profile.getDesignation());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to create faculty profile", e);
        }
    }
}
