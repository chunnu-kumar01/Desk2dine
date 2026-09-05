package com.desk2dine.controller;

import com.desk2dine.dto.UpdateProfileRequest;
import com.desk2dine.dto.UserResponse;
import com.desk2dine.service.AuthService;
import com.desk2dine.util.ApiResponse;
import com.desk2dine.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/** Lets any logged-in user view and edit their own profile. */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final AuthService authService;

    public ProfileController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    public ApiResponse<UserResponse> getProfile(HttpServletRequest httpRequest) {
        return ApiResponse.ok(authService.getProfile(SessionUtil.getCurrentUserId(httpRequest)));
    }

    @PutMapping
    public ApiResponse<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
                                                     HttpServletRequest httpRequest) {
        Long userId = SessionUtil.getCurrentUserId(httpRequest);
        return ApiResponse.ok("Profile updated", authService.updateProfile(userId, request));
    }
}
