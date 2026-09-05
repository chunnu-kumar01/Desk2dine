package com.desk2dine.service;

import com.desk2dine.dto.MenuItemRequest;
import com.desk2dine.dto.PageResult;
import com.desk2dine.entity.Category;
import com.desk2dine.entity.MenuItem;
import com.desk2dine.exception.NotFoundException;
import com.desk2dine.exception.ValidationException;
import com.desk2dine.repository.CategoryRepository;
import com.desk2dine.repository.MenuItemRepository;
import com.desk2dine.util.ValidationUtil;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * CRUD + browsing for menu items. Faculty use search()/findById() to
 * browse and order; Admin also uses create()/update()/delete().
 */
@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public MenuItemService(MenuItemRepository menuItemRepository, CategoryRepository categoryRepository,
                            AuditLogService auditLogService) {
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    public PageResult<MenuItem> search(String searchText, Long categoryId, boolean onlyAvailable,
                                        String sortBy, String sortDir, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 20 : Math.min(size, 100);
        List<MenuItem> items = menuItemRepository.search(searchText, categoryId, onlyAvailable, sortBy, sortDir, safePage, safeSize);
        long total = menuItemRepository.countSearch(searchText, categoryId, onlyAvailable);
        return new PageResult<>(items, safePage, safeSize, total);
    }

    public MenuItem findById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Menu item not found"));
    }

    public MenuItem create(MenuItemRequest request, Long actingUserId) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ValidationException("Selected category does not exist"));
        validate(request);

        MenuItem item = new MenuItem();
        item.setCategoryId(category.getId());
        item.setName(ValidationUtil.sanitize(request.getName()));
        item.setDescription(ValidationUtil.sanitize(request.getDescription()));
        item.setPrice(BigDecimal.valueOf(request.getPrice()));
        item.setImageUrl(request.getImageUrl());
        item.setAvailable(request.getAvailable() == null || request.getAvailable());

        MenuItem saved = menuItemRepository.insert(item);
        auditLogService.record(actingUserId, "MENU_ITEM_CREATED", "MENU_ITEM", saved.getId(), saved.getName());
        return saved;
    }

    public MenuItem update(Long id, MenuItemRequest request, Long actingUserId) {
        MenuItem existing = findById(id);
        categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ValidationException("Selected category does not exist"));
        validate(request);

        existing.setCategoryId(request.getCategoryId());
        existing.setName(ValidationUtil.sanitize(request.getName()));
        existing.setDescription(ValidationUtil.sanitize(request.getDescription()));
        existing.setPrice(BigDecimal.valueOf(request.getPrice()));
        existing.setImageUrl(request.getImageUrl());
        existing.setAvailable(request.getAvailable() == null || request.getAvailable());

        menuItemRepository.update(existing);
        auditLogService.record(actingUserId, "MENU_ITEM_UPDATED", "MENU_ITEM", id, existing.getName());
        return existing;
    }

    public void delete(Long id, Long actingUserId) {
        findById(id);
        menuItemRepository.delete(id);
        auditLogService.record(actingUserId, "MENU_ITEM_DELETED", "MENU_ITEM", id, "Menu item deleted");
    }

    private void validate(MenuItemRequest request) {
        if (ValidationUtil.isBlank(request.getName())) {
            throw new ValidationException("Item name is required");
        }
        if (request.getPrice() == null || request.getPrice() <= 0) {
            throw new ValidationException("Price must be greater than zero");
        }
    }
}
