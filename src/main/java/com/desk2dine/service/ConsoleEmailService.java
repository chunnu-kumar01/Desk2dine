package com.desk2dine.service;

import org.springframework.stereotype.Service;

import java.util.logging.Logger;

/**
 * Default EmailService implementation: since this project ships without
 * SMTP credentials, it logs the reset link to the server console
 * instead of actually emailing it. This keeps forgot-password fully
 * working end-to-end for local development/grading without requiring
 * an external mail account.
 *
 * To send real emails in production: add spring-boot-starter-mail to
 * pom.xml, configure spring.mail.* in application.properties with real
 * SMTP credentials, then replace this class with one that autowires
 * JavaMailSender and calls mailSender.send(...) instead of logging.
 * AuthService doesn't need to change at all — it only depends on the
 * EmailService interface.
 */
@Service
public class ConsoleEmailService implements EmailService {

    private static final Logger log = Logger.getLogger(ConsoleEmailService.class.getName());

    @Override
    public void sendPasswordResetEmail(String toEmail, String fullName, String resetLink) {
        log.info(() -> "==================== PASSWORD RESET EMAIL (console mode) ====================\n" +
                "To: " + toEmail + "\n" +
                "Hi " + fullName + ", reset your Desk2Dine password using this link (valid 30 minutes):\n" +
                resetLink + "\n" +
                "===============================================================================");
    }
}
