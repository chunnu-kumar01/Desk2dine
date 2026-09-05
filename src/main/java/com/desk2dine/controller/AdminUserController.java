package com.desk2dine.controller;

import com.desk2dine.dto.PageResult;
import com.desk2dine.dto.UserResponse;
import com.desk2dine.security.Role;
import com.desk2dine.security.RequireRole;
import com.desk2dine.service.AdminUserService;
import com.desk2dine.util.ApiResponse;
import org.springframework.web.bind.annotation.*;

/** Admin-only: browse registered accounts (faculty + admin). */
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    @RequireRole(Role.ADMIN)
    public ApiResponse<PageResult<UserResponse>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminUserService.search(search, role, sortBy, sortDir, page, size));
    }
}
