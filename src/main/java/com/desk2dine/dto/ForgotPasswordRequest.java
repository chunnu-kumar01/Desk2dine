package com.desk2dine.dto;

import jakarta.validation.constraints.NotBlank;

/** Step 1 of the forgot-password flow: the user submits their email. */
public class ForgotPasswordRequest {
    @NotBlank(message = "Email is required")
    private String email;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
