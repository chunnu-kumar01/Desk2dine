package com.desk2dine.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * What the Signup form submits. Bean Validation (@NotBlank) catches
 * empty fields; everything else (email format, mobile format, password
 * strength, password==confirmPassword, duplicate email) is checked in
 * AuthService using ValidationUtil, because those rules need either a
 * database lookup or logic too specific for a plain annotation.
 */
public class SignupRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Please confirm your password")
    private String confirmPassword;

    @NotBlank(message = "Role is required")
    private String role; // "FACULTY" or "ADMIN"

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
