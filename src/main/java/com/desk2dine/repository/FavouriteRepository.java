package com.desk2dine.repository;

import com.desk2dine.entity.MenuItem;
import com.desk2dine.exception.DatabaseOperationException;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * JDBC repository for `favourites`. Backs the "star a menu item" feature
 * on the faculty menu screen.
 */
@Repository
public class FavouriteRepository {

    private final DataSource dataSource;

    public FavouriteRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void add(Long userId, Long menuItemId) {
        // INSERT IGNORE relies on the uq_fav_user_item unique constraint, so starring
        // the same item twice is a harmless no-op instead of a duplicate-key error.
        String sql = "INSERT IGNORE INTO favourites (user_id, menu_item_id) VALUES (?, ?)";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.setLong(2, menuItemId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to add favourite", e);
        }
    }

    public void remove(Long userId, Long menuItemId) {
        String sql = "DELETE FROM favourites WHERE user_id = ? AND menu_item_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.setLong(2, menuItemId);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to remove favourite", e);
        }
    }

    /** Returns the caller's favourite menu items (joined for full item detail, not just ids). */
    public List<MenuItem> findByUser(Long userId) {
        String sql = "SELECT m.*, c.name AS category_name FROM favourites f " +
                "JOIN menu_items m ON m.id = f.menu_item_id " +
                "JOIN categories c ON c.id = m.category_id " +
                "WHERE f.user_id = ? ORDER BY f.created_at DESC";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, userId);
            List<MenuItem> items = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    MenuItem item = new MenuItem();
                    item.setId(rs.getLong("id"));
                    item.setCategoryId(rs.getLong("category_id"));
                    item.setCategoryName(rs.getString("category_name"));
                    item.setName(rs.getString("name"));
                    item.setDescription(rs.getString("description"));
                    item.setPrice(rs.getBigDecimal("price"));
                    item.setImageUrl(rs.getString("image_url"));
                    item.setAvailable(rs.getBoolean("is_available"));
                    items.add(item);
                }
            }
            return items;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to load favourites", e);
        }
    }

    public boolean isFavourite(Long userId, Long menuItemId) {
        String sql = "SELECT 1 FROM favourites WHERE user_id = ? AND menu_item_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.setLong(2, menuItemId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to check favourite", e);
        }
    }
}
