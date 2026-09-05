package com.desk2dine.dto;

import com.desk2dine.entity.User;

import java.time.LocalDateTime;

/**
 * Safe, outward-facing view of a User — deliberately excludes
 * passwordHash so it can never accidentally be serialized back to the
 * browser (unlike the User entity, which a careless controller could
 * return directly).
 */
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String mobileNumber;
    private String role;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        UserResponse dto = new UserResponse();
        dto.id = user.getId();
        dto.fullName = user.getFullName();
        dto.email = user.getEmail();
        dto.mobileNumber = user.getMobileNumber();
        dto.role = user.getRole().name();
        dto.createdAt = user.getCreatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getMobileNumber() { return mobileNumber; }
    public String getRole() { return role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
