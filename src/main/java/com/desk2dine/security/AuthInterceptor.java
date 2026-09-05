package com.desk2dine.security;

import com.desk2dine.util.ApiResponse;
import com.desk2dine.util.SessionUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Set;

/**
 * This is the "prevent unauthorized page access" and "role-based
 * authorization" requirement, implemented by hand (no Spring Security
 * framework) so the whole auth flow is visible and easy to explain.
 *
 * How it works, on every request to /api/**:
 *   1. If the path is in PUBLIC_PATHS (signup/login/forgot-password/
 *      reset-password), let it through with no session check.
 *   2. Otherwise, require an active session (SessionUtil.isLoggedIn) —
 *      if missing, respond 401 immediately and stop the request from
 *      ever reaching the controller.
 *   3. If the target controller method is annotated @RequireRole(X),
 *      compare X to the session's role — if they don't match, respond
 *      403 and stop.
 *
 * Registered against /api/** by WebConfig. Static files (the HTML/CSS/
 * JS pages themselves) are not covered by this interceptor — the pages
 * load freely, but every fetch() call they make to /api/... is guarded
 * here, and the frontend JS redirects to the login page on a 401.
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    private static final Set<String> PUBLIC_PATHS = Set.of(
            "/api/auth/signup",
            "/api/auth/login",
            "/api/auth/forgot-password",
            "/api/auth/reset-password"
    );

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();

        if (PUBLIC_PATHS.contains(path)) {
            return true;
        }

        if (!SessionUtil.isLoggedIn(request)) {
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "Please log in to continue.");
            return false;
        }

        if (handler instanceof HandlerMethod handlerMethod) {
            RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
            if (requireRole == null) {
                requireRole = handlerMethod.getBeanType().getAnnotation(RequireRole.class);
            }
            if (requireRole != null) {
                Role currentRole = SessionUtil.getCurrentRole(request);
                if (currentRole != requireRole.value()) {
                    writeError(response, HttpServletResponse.SC_FORBIDDEN,
                            "You don't have permission to perform this action.");
                    return false;
                }
            }
        }

        return true;
    }

    private void writeError(HttpServletResponse response, int status, String message) throws Exception {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.error(message)));
    }
}
