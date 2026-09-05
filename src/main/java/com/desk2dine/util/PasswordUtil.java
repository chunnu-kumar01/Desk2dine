package com.desk2dine.util;

import org.mindrot.jbcrypt.BCrypt;

/**
 * Wraps jBCrypt so the rest of the app never touches a raw hashing
 * algorithm directly. Centralising it here means the salt rounds (cost
 * factor) can be tuned in exactly one place.
 *
 * Why BCrypt: unlike MD5/SHA-256, BCrypt is deliberately slow and has a
 * built-in random salt per password, which makes both rainbow-table
 * attacks and brute-forcing far more expensive.
 *
 * Called by: AuthService (signup, login, reset password, change password).
 */
public final class PasswordUtil {

    /** Cost factor for BCrypt — higher is slower/safer. 10-12 is standard for a web app. */
    private static final int SALT_ROUNDS = 10;

    private PasswordUtil() {
    }

    /** Hashes a plain-text password. The returned string already contains the salt. */
    public static String hash(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(SALT_ROUNDS));
    }

    /** Verifies a plain-text password against a previously stored BCrypt hash. */
    public static boolean matches(String plainPassword, String storedHash) {
        if (plainPassword == null || storedHash == null) {
            return false;
        }
        try {
            return BCrypt.checkpw(plainPassword, storedHash);
        } catch (IllegalArgumentException e) {
            // storedHash was not a valid BCrypt hash — treat as no match rather than crash
            return false;
        }
    }
}
