package com.desk2dine.controller;

import com.desk2dine.dto.MenuItemRequest;
import com.desk2dine.dto.PageResult;
import com.desk2dine.entity.MenuItem;
import com.desk2dine.security.Role;
import com.desk2dine.security.RequireRole;
import com.desk2dine.service.MenuItemService;
import com.desk2dine.util.ApiResponse;
import com.desk2dine.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * GET is available to any logged-in user (faculty browsing the menu,
 * admin managing it); create/update/delete are ADMIN-only.
 */
@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {

    private final MenuItemService menuItemService;

    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    @GetMapping
    public ApiResponse<PageResult<MenuItem>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "false") boolean onlyAvailable,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(menuItemService.search(search, categoryId, onlyAvailable, sortBy, sortDir, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<MenuItem> get(@PathVariable Long id) {
        return ApiResponse.ok(menuItemService.findById(id));
    }

    @PostMapping
    @RequireRole(Role.ADMIN)
    public ApiResponse<MenuItem> create(@Valid @RequestBody MenuItemRequest request,
                                        @RequestParam("imageFile") MultipartFile imageFile,
                                        HttpServletRequest httpRequest) throws Exception {
        Long userId = SessionUtil.getCurrentUserId(httpRequest);
        MenuItem created = menuItemService.create(request, userId, imageFile);
        return ApiResponse.ok("Menu item created", created);
    }

    @PutMapping("/{id}")
    @RequireRole(Role.ADMIN)
    public ApiResponse<MenuItem> update(@PathVariable Long id, @Valid @RequestBody MenuItemRequest request,
                                        @RequestParam("imageFile") MultipartFile imageFile,
                                        HttpServletRequest httpRequest) throws Exception {
        Long userId = SessionUtil.getCurrentUserId(httpRequest);
        MenuItem updated = menuItemService.update(id, request, userId, imageFile);
        return ApiResponse.ok("Menu item updated", updated);
    }

    @DeleteMapping("/{id}")
    @RequireRole(Role.ADMIN)
    public ApiResponse<Void> delete(@PathVariable Long id, HttpServletRequest httpRequest) {
        menuItemService.delete(id, SessionUtil.getCurrentUserId(httpRequest));
        return ApiResponse.ok("Menu item deleted", null);
    }
}