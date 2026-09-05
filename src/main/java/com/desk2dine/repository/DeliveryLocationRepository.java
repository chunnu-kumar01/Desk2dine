package com.desk2dine.repository;

import com.desk2dine.entity.DeliveryLocation;
import com.desk2dine.exception.DatabaseOperationException;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** JDBC repository for the `delivery_locations` table — full CRUD for the admin console. */
@Repository
public class DeliveryLocationRepository {

    private final DataSource dataSource;

    public DeliveryLocationRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public DeliveryLocation insert(DeliveryLocation location) {
        String sql = "INSERT INTO delivery_locations (name, block, floor, is_active) VALUES (?, ?, ?, ?)";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, location.getName());
            ps.setString(2, location.getBlock());
            ps.setString(3, location.getFloor());
            ps.setBoolean(4, location.isActive());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) location.setId(keys.getLong(1));
            }
            return location;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to create delivery location", e);
        }
    }

    public void update(DeliveryLocation location) {
        String sql = "UPDATE delivery_locations SET name = ?, block = ?, floor = ?, is_active = ? WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, location.getName());
            ps.setString(2, location.getBlock());
            ps.setString(3, location.getFloor());
            ps.setBoolean(4, location.isActive());
            ps.setLong(5, location.getId());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to update delivery location", e);
        }
    }

    public void delete(Long id) {
        String sql = "DELETE FROM delivery_locations WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to delete delivery location", e);
        }
    }

    public Optional<DeliveryLocation> findById(Long id) {
        String sql = "SELECT * FROM delivery_locations WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to look up delivery location", e);
        }
    }

    public List<DeliveryLocation> findAllActive() {
        String sql = "SELECT * FROM delivery_locations WHERE is_active = 1 ORDER BY name ASC";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<DeliveryLocation> results = new ArrayList<>();
            while (rs.next()) results.add(mapRow(rs));
            return results;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to list delivery locations", e);
        }
    }

    public List<DeliveryLocation> findAll() {
        String sql = "SELECT * FROM delivery_locations ORDER BY name ASC";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<DeliveryLocation> results = new ArrayList<>();
            while (rs.next()) results.add(mapRow(rs));
            return results;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to list delivery locations", e);
        }
    }

    private DeliveryLocation mapRow(ResultSet rs) throws SQLException {
        DeliveryLocation location = new DeliveryLocation();
        location.setId(rs.getLong("id"));
        location.setName(rs.getString("name"));
        location.setBlock(rs.getString("block"));
        location.setFloor(rs.getString("floor"));
        location.setActive(rs.getBoolean("is_active"));
        return location;
    }
}
