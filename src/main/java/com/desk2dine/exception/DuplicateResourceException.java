package com.desk2dine.exception;

/** Thrown when a unique constraint would be violated (e.g. signup with an email already in use). */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
