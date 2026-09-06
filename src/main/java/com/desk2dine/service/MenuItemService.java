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
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
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
    private static final String UPLOAD_DIR = "src/main/resources/static/uploads";

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

    public MenuItem create(MenuItemRequest request, Long actingUserId, MultipartFile imageFile) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ValidationException("Selected category does not exist"));
        validate(request);

        MenuItem item = new MenuItem();
        item.setCategoryId(category.getId());
        item.setName(ValidationUtil.sanitize(request.getName()));
        item.setDescription(ValidationUtil.sanitize(request.getDescription()));
        item.setPrice(BigDecimal.valueOf(request.getPrice()));
        item.setAvailable(request.getAvailable() == null || request.getAvailable());

        // Handle image upload
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String uploadPath = System.getProperty("user.dir") + "/" + UPLOAD_DIR;
                File uploadDir = new File(uploadPath);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }
                String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
                Path filePath = Paths.get(uploadPath, fileName);
                Files.write(filePath, imageFile.getBytes());
                item.setImageUrl("/uploads/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload image", e);
            }
        } else {
            // Set a default image if no file uploaded
            item.setImageUrl("/uploads/default.png");
        }

        MenuItem saved = menuItemRepository.insert(item);
        auditLogService.record(actingUserId, "MENU_ITEM_CREATED", "MENU_ITEM", saved.getId(), saved.getName());
        return saved;
    }

    public MenuItem update(Long id, MenuItemRequest request, Long actingUserId, MultipartFile imageFile) {
        MenuItem existing = findById(id);
        categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ValidationException("Selected category does not exist"));
        validate(request);

        existing.setCategoryId(request.getCategoryId());
        existing.setName(ValidationUtil.sanitize(request.getName()));
        existing.setDescription(ValidationUtil.sanitize(request.getDescription()));
        existing.setPrice(BigDecimal.valueOf(request.getPrice()));
        existing.setAvailable(request.getAvailable() == null || request.getAvailable());

        // Handle image upload - replace existing image
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String uploadPath = System.getProperty("user.dir") + "/" + UPLOAD_DIR;
                File uploadDir = new File(uploadPath);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }
                String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
                Path filePath = Paths.get(uploadPath, fileName);
                Files.write(filePath, imageFile.getBytes());
                existing.setImageUrl("/uploads/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload image", e);
            }
        }

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