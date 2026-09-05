package com.desk2dine.exception;

/** Thrown when there is no valid session (not logged in) or credentials are wrong. */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
