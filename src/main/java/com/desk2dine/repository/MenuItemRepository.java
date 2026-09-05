package com.desk2dine.repository;

import com.desk2dine.entity.MenuItem;
import com.desk2dine.exception.DatabaseOperationException;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * JDBC repository for `menu_items`, joined with `categories` for the
 * category name. Backs both the read-only faculty menu screen (search +
 * category filter + sort + pagination) and the admin CRUD screen.
 */
@Repository
public class MenuItemRepository {

    private final DataSource dataSource;

    public MenuItemRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public MenuItem insert(MenuItem item) {
        String sql = "INSERT INTO menu_items (category_id, name, description, price, image_url, is_available) " +
                "VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setLong(1, item.getCategoryId());
            ps.setString(2, item.getName());
            ps.setString(3, item.getDescription());
            ps.setBigDecimal(4, item.getPrice());
            ps.setString(5, item.getImageUrl());
            ps.setBoolean(6, item.isAvailable());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) item.setId(keys.getLong(1));
            }
            return item;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to create menu item", e);
        }
    }

    public void update(MenuItem item) {
        String sql = "UPDATE menu_items SET category_id = ?, name = ?, description = ?, price = ?, " +
                "image_url = ?, is_available = ? WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, item.getCategoryId());
            ps.setString(2, item.getName());
            ps.setString(3, item.getDescription());
            ps.setBigDecimal(4, item.getPrice());
            ps.setString(5, item.getImageUrl());
            ps.setBoolean(6, item.isAvailable());
            ps.setLong(7, item.getId());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to update menu item", e);
        }
    }

    public void delete(Long id) {
        String sql = "DELETE FROM menu_items WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to delete menu item", e);
        }
    }

    public Optional<MenuItem> findById(Long id) {
        String sql = baseSelect() + " WHERE m.id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to look up menu item", e);
        }
    }

    /**
     * Search + filter + sort + paginate over menu items.
     * @param searchText   matched against item name (LIKE), or null/blank for no filter
     * @param categoryId   restrict to one category, or null for all categories
     * @param onlyAvailable if true, only rows with is_available = 1
     * @param sortBy       "name" or "price" (anything else falls back to "name")
     * @param sortDir      "asc" or "desc"
     */
    public List<MenuItem> search(String searchText, Long categoryId, boolean onlyAvailable,
                                  String sortBy, String sortDir, int page, int size) {
        StringBuilder sql = new StringBuilder(baseSelect()).append(" WHERE 1=1 ");
        List<Object> params = new ArrayList<>();
        appendFilters(sql, params, searchText, categoryId, onlyAvailable);

        String column = "price".equalsIgnoreCase(sortBy) ? "m.price" : "m.name";
        String direction = "desc".equalsIgnoreCase(sortDir) ? "DESC" : "ASC";
        sql.append(" ORDER BY ").append(column).append(" ").append(direction).append(" LIMIT ? OFFSET ?");
        params.add(size);
        params.add(page * size);

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) ps.setObject(i + 1, params.get(i));
            List<MenuItem> items = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) items.add(mapRow(rs));
            }
            return items;
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to search menu items", e);
        }
    }

    public long countSearch(String searchText, Long categoryId, boolean onlyAvailable) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM menu_items m WHERE 1=1 ");
        List<Object> params = new ArrayList<>();
        appendFilters(sql, params, searchText, categoryId, onlyAvailable);
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) ps.setObject(i + 1, params.get(i));
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getLong(1) : 0;
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to count menu items", e);
        }
    }

    private void appendFilters(StringBuilder sql, List<Object> params, String searchText,
                                Long categoryId, boolean onlyAvailable) {
        if (searchText != null && !searchText.isBlank()) {
            sql.append("AND m.name LIKE ? ");
            params.add("%" + searchText.trim() + "%");
        }
        if (categoryId != null) {
            sql.append("AND m.category_id = ? ");
            params.add(categoryId);
        }
        if (onlyAvailable) {
            sql.append("AND m.is_available = 1 ");
        }
    }

    private String baseSelect() {
        return "SELECT m.*, c.name AS category_name FROM menu_items m " +
                "JOIN categories c ON c.id = m.category_id";
    }

    private MenuItem mapRow(ResultSet rs) throws SQLException {
        MenuItem item = new MenuItem();
        item.setId(rs.getLong("id"));
        item.setCategoryId(rs.getLong("category_id"));
        item.setCategoryName(rs.getString("category_name"));
        item.setName(rs.getString("name"));
        item.setDescription(rs.getString("description"));
        item.setPrice(rs.getBigDecimal("price"));
        item.setImageUrl(rs.getString("image_url"));
        item.setAvailable(rs.getBoolean("is_available"));
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) item.setCreatedAt(createdAt.toLocalDateTime());
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) item.setUpdatedAt(updatedAt.toLocalDateTime());
        return item;
    }
}
