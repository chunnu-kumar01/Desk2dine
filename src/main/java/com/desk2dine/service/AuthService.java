package com.desk2dine.service;

import com.desk2dine.dto.*;
import com.desk2dine.entity.AdminProfile;
import com.desk2dine.entity.FacultyProfile;
import com.desk2dine.entity.PasswordResetToken;
import com.desk2dine.entity.User;
import com.desk2dine.exception.DatabaseOperationException;
import com.desk2dine.exception.DuplicateResourceException;
import com.desk2dine.exception.NotFoundException;
import com.desk2dine.exception.UnauthorizedException;
import com.desk2dine.exception.ValidationException;
import com.desk2dine.repository.AdminProfileRepository;
import com.desk2dine.repository.FacultyProfileRepository;
import com.desk2dine.repository.PasswordResetTokenRepository;
import com.desk2dine.repository.UserRepository;
import com.desk2dine.security.Role;
import com.desk2dine.util.PasswordUtil;
import com.desk2dine.util.SessionUtil;
import com.desk2dine.util.TokenUtil;
import com.desk2dine.util.ValidationUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;

/**
 * Owns the whole authentication lifecycle: signup, login, logout,
 * forgot/reset password, change password, and profile updates. This is
 * the class every auth-related controller calls into — controllers stay
 * thin (parse the request, call a service method, wrap the result in an
 * ApiResponse) while every rule (validation, hashing, transactions,
 * session handling, auditing) lives here.
 *
 * Data flow for Signup (frontend -> ... -> MySQL -> frontend):
 *   1. signup.html collects the form and POSTs JSON to /api/auth/signup.
 *   2. AuthController#signup receives it as a validated SignupRequest.
 *   3. AuthController calls AuthService#signup.
 *   4. AuthService validates business rules, hashes the password with
 *      PasswordUtil (jBCrypt), opens one JDBC Connection, and calls
 *      UserRepository#insert followed by FacultyProfileRepository#insert
 *      or AdminProfileRepository#insert using THAT SAME Connection —
 *      then commits. If step 2 of that pair fails, the whole transaction
 *      rolls back so we never end up with a user row and no profile row.
 *   5. AuthService records an audit_logs row and returns a UserResponse
 *      (never the raw User, so the password hash can't leak).
 *   6. AuthController wraps it in ApiResponse.ok(...) and Spring
 *      serializes that to JSON for the browser.
 */
@Service
public class AuthService {

    private static final int RESET_TOKEN_VALID_MINUTES = 30;

    private final DataSource dataSource;
    private final UserRepository userRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final AdminProfileRepository adminProfileRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public AuthService(DataSource dataSource,
                        UserRepository userRepository,
                        FacultyProfileRepository facultyProfileRepository,
                        AdminProfileRepository adminProfileRepository,
                        PasswordResetTokenRepository passwordResetTokenRepository,
                        EmailService emailService,
                        AuditLogService auditLogService) {
        this.dataSource = dataSource;
        this.userRepository = userRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.adminProfileRepository = adminProfileRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
        this.auditLogService = auditLogService;
    }

    public UserResponse signup(SignupRequest request) {
        String fullName = ValidationUtil.sanitize(request.getFullName());
        String email = request.getEmail() == null ? null : request.getEmail().trim().toLowerCase();
        String mobile = request.getMobileNumber() == null ? null : request.getMobileNumber().trim();

        // ---- Validation (defence in depth on top of @NotBlank on the DTO) ----
        if (ValidationUtil.isBlank(fullName)) {
            throw new ValidationException("Full name is required");
        }
        if (!ValidationUtil.isValidEmail(email)) {
            throw new ValidationException("Please enter a valid email address");
        }
        if (!ValidationUtil.isValidMobile(mobile)) {
            throw new ValidationException("Please enter a valid 10-digit mobile number");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Password and confirm password do not match");
        }
        if (!ValidationUtil.isStrongPassword(request.getPassword())) {
            throw new ValidationException(
                    "Password must be at least 8 characters and include an uppercase letter, " +
                            "a lowercase letter, a number, and a special character");
        }
        Role role = parseRole(request.getRole());

        // Only FACULTY can self-register. Admin accounts must be created by an existing admin.
        if (role == Role.ADMIN) {
            throw new ValidationException("Admin accounts cannot be self-registered. Contact an administrator.");
        }

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setMobileNumber(mobile);
        user.setPasswordHash(PasswordUtil.hash(request.getPassword()));
        user.setRole(role);
        user.setActive(true);

        // ---- Transaction: users row + faculty/admin row must both succeed ----
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try {
                userRepository.insert(connection, user);

                if (role == Role.FACULTY) {
                    FacultyProfile profile = new FacultyProfile();
                    profile.setUserId(user.getId());
                    facultyProfileRepository.insert(connection, profile);
                } else {
                    AdminProfile profile = new AdminProfile();
                    profile.setUserId(user.getId());
                    profile.setAdminLevel("STANDARD");
                    adminProfileRepository.insert(connection, profile);
                }

                connection.commit();
            } catch (RuntimeException e) {
                connection.rollback();
                throw e;
            } finally {
                connection.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw new DatabaseOperationException("Failed to create account", e);
        }

        auditLogService.record(user.getId(), "SIGNUP", "USER", user.getId(),
                "New " + role + " account created for " + email);

        return UserResponse.from(user);
    }

    public UserResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        String email = request.getEmail() == null ? null : request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                // Deliberately the same message whether the email doesn't exist or the
                // password is wrong — never reveal which one it was to an attacker.
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!user.isActive()) {
            throw new UnauthorizedException("This account has been deactivated. Contact an administrator.");
        }
        if (!PasswordUtil.matches(request.getPassword(), user.getPasswordHash())) {
            auditLogService.record(user.getId(), "LOGIN_FAILED", "USER", user.getId(), "Incorrect password");
            throw new UnauthorizedException("Invalid email or password");
        }

        SessionUtil.startSession(httpRequest, user.getId(), user.getRole(), user.getFullName());
        auditLogService.record(user.getId(), "LOGIN", "USER", user.getId(), "Login successful");

        return UserResponse.from(user);
    }

    public void logout(HttpServletRequest httpRequest) {
        Long userId = SessionUtil.getCurrentUserId(httpRequest);
        SessionUtil.destroySession(httpRequest);
        if (userId != null) {
            auditLogService.record(userId, "LOGOUT", "USER", userId, "Logout");
        }
    }

    /**
     * Always appears to succeed from the caller's point of view (even if
     * the email isn't registered) so this endpoint can't be used to find
     * out which emails have accounts.
     */
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail() == null ? null : request.getEmail().trim().toLowerCase();
        userRepository.findByEmail(email).ifPresent(user -> {
            PasswordResetToken token = new PasswordResetToken();
            token.setUserId(user.getId());
            token.setToken(TokenUtil.generateToken());
            token.setExpiresAt(LocalDateTime.now().plusMinutes(RESET_TOKEN_VALID_MINUTES));
            token.setUsed(false);
            passwordResetTokenRepository.insert(token);

            String resetLink = baseUrl + "/reset-password.html?token=" + token.getToken();
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);

            auditLogService.record(user.getId(), "FORGOT_PASSWORD_REQUESTED", "USER", user.getId(),
                    "Password reset link generated");
        });
    }

    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("New password and confirm password do not match");
        }
        if (!ValidationUtil.isStrongPassword(request.getNewPassword())) {
            throw new ValidationException(
                    "Password must be at least 8 characters and include an uppercase letter, " +
                            "a lowercase letter, a number, and a special character");
        }

        PasswordResetToken token = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ValidationException("This reset link is invalid or has already been used"));

        if (token.isUsed()) {
            throw new ValidationException("This reset link has already been used");
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ValidationException("This reset link has expired. Please request a new one.");
        }

        userRepository.updatePassword(token.getUserId(), PasswordUtil.hash(request.getNewPassword()));
        passwordResetTokenRepository.markUsed(token.getId());

        auditLogService.record(token.getUserId(), "PASSWORD_RESET", "USER", token.getUserId(),
                "Password reset via forgot-password link");
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!PasswordUtil.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ValidationException("Current password is incorrect");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("New password and confirm password do not match");
        }
        if (!ValidationUtil.isStrongPassword(request.getNewPassword())) {
            throw new ValidationException(
                    "Password must be at least 8 characters and include an uppercase letter, " +
                            "a lowercase letter, a number, and a special character");
        }

        userRepository.updatePassword(userId, PasswordUtil.hash(request.getNewPassword()));
        auditLogService.record(userId, "PASSWORD_CHANGED", "USER", userId, "Password changed from profile page");
    }

    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return UserResponse.from(user);
    }

    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        String fullName = ValidationUtil.sanitize(request.getFullName());
        String mobile = request.getMobileNumber() == null ? null : request.getMobileNumber().trim();

        if (ValidationUtil.isBlank(fullName)) {
            throw new ValidationException("Full name is required");
        }
        if (!ValidationUtil.isValidMobile(mobile)) {
            throw new ValidationException("Please enter a valid 10-digit mobile number");
        }

        userRepository.updateProfile(userId, fullName, mobile);
        auditLogService.record(userId, "PROFILE_UPDATED", "USER", userId, "Profile details updated");
        return getProfile(userId);
    }

    private Role parseRole(String rawRole) {
        try {
            return Role.valueOf(rawRole.trim().toUpperCase());
        } catch (Exception e) {
            throw new ValidationException("Role must be either FACULTY or ADMIN");
        }
    }
}
