package com.desk2dine.controller;

import com.desk2dine.dto.CategoryRequest;
import com.desk2dine.entity.Category;
import com.desk2dine.security.Role;
import com.desk2dine.security.RequireRole;
import com.desk2dine.service.CategoryService;
import com.desk2dine.util.ApiResponse;
import com.desk2dine.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Any logged-in user can browse categories; only ADMIN can create/update/delete them. */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ApiResponse<List<Category>> list() {
        return ApiResponse.ok(categoryService.listAll());
    }

    @PostMapping
    @RequireRole(Role.ADMIN)
    public ApiResponse<Category> create(@Valid @RequestBody CategoryRequest request, HttpServletRequest httpRequest) {
        return ApiResponse.ok("Category created", categoryService.create(request, SessionUtil.getCurrentUserId(httpRequest)));
    }

    @PutMapping("/{id}")
    @RequireRole(Role.ADMIN)
    public ApiResponse<Category> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request,
                                         HttpServletRequest httpRequest) {
        return ApiResponse.ok("Category updated", categoryService.update(id, request, SessionUtil.getCurrentUserId(httpRequest)));
    }

    @DeleteMapping("/{id}")
    @RequireRole(Role.ADMIN)
    public ApiResponse<Void> delete(@PathVariable Long id, HttpServletRequest httpRequest) {
        categoryService.delete(id, SessionUtil.getCurrentUserId(httpRequest));
        return ApiResponse.ok("Category deleted", null);
    }
}
