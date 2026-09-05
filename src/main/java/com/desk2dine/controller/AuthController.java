package com.desk2dine.controller;

import com.desk2dine.dto.*;
import com.desk2dine.service.AuthService;
import com.desk2dine.util.ApiResponse;
import com.desk2dine.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/**
 * Every authentication HTTP endpoint. This is the only controller whose
 * /signup, /login, /forgot-password, /reset-password paths are public
 * (see AuthInterceptor.PUBLIC_PATHS) — everything else on this
 * controller (/logout, /me, /change-password) requires an active
 * session like any other controller.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ApiResponse<UserResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ApiResponse.ok("Account created successfully. Please log in.", authService.signup(request));
    }

    @PostMapping("/login")
    public ApiResponse<UserResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        return ApiResponse.ok("Login successful", authService.login(request, httpRequest));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest httpRequest) {
        authService.logout(httpRequest);
        return ApiResponse.ok("Logged out", null);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        // Same message whether or not the email exists - prevents user enumeration.
        return ApiResponse.ok("If an account exists for that email, a reset link has been sent.", null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.ok("Password reset successfully. Please log in with your new password.", null);
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request, HttpServletRequest httpRequest) {
        authService.changePassword(SessionUtil.getCurrentUserId(httpRequest), request);
        return ApiResponse.ok("Password changed successfully", null);
    }

    /** Lets the frontend ask "am I logged in, and as whom?" on page load. */
    @GetMapping("/me")
    public ApiResponse<UserResponse> me(HttpServletRequest httpRequest) {
        Long userId = SessionUtil.getCurrentUserId(httpRequest);
        return ApiResponse.ok(authService.getProfile(userId));
    }
}
