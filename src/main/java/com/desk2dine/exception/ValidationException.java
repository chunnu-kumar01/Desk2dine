package com.desk2dine.exception;

/** Thrown for hand-written validation failures (password strength, mobile format, etc). */
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}
