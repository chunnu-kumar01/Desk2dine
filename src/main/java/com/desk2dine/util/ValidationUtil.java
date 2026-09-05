package com.desk2dine.util;

import java.util.regex.Pattern;

/**
 * Central place for every hand-written validation rule that Bean
 * Validation annotations can't express cleanly (password strength,
 * Indian mobile number format) plus basic input sanitisation to reduce
 * XSS risk when user-entered text is later rendered in the browser.
 *
 * Called by: AuthService (signup, reset password), ProfileService,
 * and any service accepting free-text input from the client.
 */
public final class ValidationUtil {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    // Accepts a 10-digit Indian mobile number, optionally prefixed with +91 / 91 / 0
    private static final Pattern MOBILE_PATTERN =
            Pattern.compile("^(?:\\+91|91|0)?[6-9]\\d{9}$");

    // At least 8 chars, one uppercase, one lowercase, one digit, one special character
    private static final Pattern STRONG_PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!_\\-]).{8,}$");

    private ValidationUtil() {
    }

    public static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    public static boolean isValidEmail(String email) {
        return !isBlank(email) && EMAIL_PATTERN.matcher(email.trim()).matches();
    }

    public static boolean isValidMobile(String mobile) {
        return !isBlank(mobile) && MOBILE_PATTERN.matcher(mobile.trim()).matches();
    }

    /** Requires 8+ chars with upper, lower, digit, and special character. */
    public static boolean isStrongPassword(String password) {
        return password != null && STRONG_PASSWORD_PATTERN.matcher(password).matches();
    }

    /**
     * Strips characters that are commonly used for HTML/script injection.
     * This is a defence-in-depth measure — output encoding on the frontend
     * (which this project already does via textContent-based escaping in
     * common.js) remains the primary XSS defence.
     */
    public static String sanitize(String input) {
        if (input == null) return null;
        return input.trim()
                .replace("<", "")
                .replace(">", "")
                .replace("\"", "")
                .replace("'", "")
                .replace(";", "")
                .replace("--", "");
    }
}
