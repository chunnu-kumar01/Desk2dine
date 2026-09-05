package com.desk2dine.exception;

/** Thrown when a logged-in user's role doesn't permit the action (e.g. faculty hitting an admin endpoint). */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
