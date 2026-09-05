package com.desk2dine.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Put this on any controller method that only a specific role may call
 * (e.g. @RequireRole(Role.ADMIN) on "create menu item"). AuthInterceptor
 * reads this annotation via reflection on every request and rejects the
 * call with 403 Forbidden if the logged-in user's role doesn't match —
 * this is the project's role-based authorization mechanism.
 *
 * Methods with no @RequireRole are still blocked if the caller isn't
 * logged in at all (see AuthInterceptor's PUBLIC_PATHS check) — this
 * annotation only narrows *which* logged-in role may proceed.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface RequireRole {
    Role value();
}
