package com.desk2dine.service;

/**
 * Abstraction over "send an email to a user". Kept as an interface so
 * the real SMTP implementation can be swapped in later without touching
 * AuthService at all — see ConsoleEmailService for the default, and the
 * README for how to plug in a real mail provider.
 */
public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String fullName, String resetLink);
}
