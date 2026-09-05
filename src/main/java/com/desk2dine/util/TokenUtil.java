package com.desk2dine.util;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Generates cryptographically strong, URL-safe random tokens.
 * Used for password-reset links so the token can't be guessed or
 * brute-forced in any practical amount of time.
 *
 * Called by: AuthService#forgotPassword.
 */
public final class TokenUtil {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private TokenUtil() {
    }

    /** Returns a random, URL-safe token (~43 characters for 32 bytes of entropy). */
    public static String generateToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
