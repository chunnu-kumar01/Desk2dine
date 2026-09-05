package com.desk2dine.service;

import com.desk2dine.dto.CategoryRequest;
import com.desk2dine.entity.Category;
import com.desk2dine.exception.DuplicateResourceException;
import com.desk2dine.exception.NotFoundException;
import com.desk2dine.exception.ValidationException;
import com.desk2dine.repository.CategoryRepository;
import com.desk2dine.util.ValidationUtil;
import org.springframework.stereotype.Service;

import java.util.List;

/** CRUD for menu categories, called by CategoryController (admin-only writes, everyone can read). */
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuditLogService auditLogService;

    public CategoryService(CategoryRepository categoryRepository, AuditLogService auditLogService) {
        this.categoryRepository = categoryRepository;
        this.auditLogService = auditLogService;
    }

    public List<Category> listAll() {
        return categoryRepository.findAll();
    }

    public Category create(CategoryRequest request, Long actingUserId) {
        String name = ValidationUtil.sanitize(request.getName());
        if (ValidationUtil.isBlank(name)) {
            throw new ValidationException("Category name is required");
        }
        if (categoryRepository.existsByName(name)) {
            throw new DuplicateResourceException("A category with this name already exists");
        }
        Category category = new Category();
        category.setName(name);
        category.setDescription(ValidationUtil.sanitize(request.getDescription()));
        Category saved = categoryRepository.insert(category);
        auditLogService.record(actingUserId, "CATEGORY_CREATED", "CATEGORY", saved.getId(), name);
        return saved;
    }

    public Category update(Long id, CategoryRequest request, Long actingUserId) {
        categoryRepository.findById(id).orElseThrow(() -> new NotFoundException("Category not found"));
        String name = ValidationUtil.sanitize(request.getName());
        if (ValidationUtil.isBlank(name)) {
            throw new ValidationException("Category name is required");
        }
        categoryRepository.update(id, name, ValidationUtil.sanitize(request.getDescription()));
        auditLogService.record(actingUserId, "CATEGORY_UPDATED", "CATEGORY", id, name);
        return categoryRepository.findById(id).orElseThrow();
    }

    public void delete(Long id, Long actingUserId) {
        categoryRepository.findById(id).orElseThrow(() -> new NotFoundException("Category not found"));
        categoryRepository.delete(id);
        auditLogService.record(actingUserId, "CATEGORY_DELETED", "CATEGORY", id, "Category deleted");
    }
}
