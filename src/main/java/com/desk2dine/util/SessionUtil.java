package com.desk2dine.util;

import com.desk2dine.security.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

/**
 * Wraps HttpSession so the rest of the app never touches raw session
 * attribute keys directly. This is the "secure session" required by the
 * spec: after a successful login, AuthService puts the user's id and
 * role into the servlet session; Spring Boot's embedded Tomcat issues a
 * JSESSIONID cookie (HttpOnly by default, so JavaScript can't read it —
 * this is what stops a stolen-via-XSS session token). AuthInterceptor
 * reads these same attributes on every subsequent request to decide
 * whether the caller is logged in and what they're allowed to do.
 *
 * Called by: AuthService (login/logout), AuthInterceptor (every
 * protected request), and any controller that needs to know "who is
 * making this request" (e.g. OrderController needs the faculty's own
 * user id to place an order under their name).
 */
public final class SessionUtil {

    private static final String SESSION_USER_ID = "USER_ID";
    private static final String SESSION_USER_ROLE = "USER_ROLE";
    private static final String SESSION_USER_NAME = "USER_NAME";

    private SessionUtil() {
    }

    public static void startSession(HttpServletRequest request, Long userId, Role role, String fullName) {
        // true = create a new session if one doesn't already exist
        HttpSession session = request.getSession(true);
        session.setAttribute(SESSION_USER_ID, userId);
        session.setAttribute(SESSION_USER_ROLE, role.name());
        session.setAttribute(SESSION_USER_NAME, fullName);
    }

    public static void destroySession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    /** Returns the logged-in user's id, or null if there is no active session. */
    public static Long getCurrentUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        Object value = session.getAttribute(SESSION_USER_ID);
        return value instanceof Long ? (Long) value : null;
    }

    /** Returns the logged-in user's role, or null if there is no active session. */
    public static Role getCurrentRole(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        Object value = session.getAttribute(SESSION_USER_ROLE);
        return value == null ? null : Role.valueOf(value.toString());
    }

    public static String getCurrentUserName(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        Object value = session.getAttribute(SESSION_USER_NAME);
        return value == null ? null : value.toString();
    }

    public static boolean isLoggedIn(HttpServletRequest request) {
        return getCurrentUserId(request) != null;
    }
}
