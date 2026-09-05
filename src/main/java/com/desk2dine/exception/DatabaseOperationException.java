package com.desk2dine.exception;

/**
 * Wraps a checked java.sql.SQLException so repositories can throw an
 * unchecked exception instead of forcing "throws SQLException" up
 * through every service and controller method. GlobalExceptionHandler
 * turns this into a safe, generic 500 response (the real SQL error and
 * stack trace are logged server-side, never sent to the client).
 */
public class DatabaseOperationException extends RuntimeException {
    public DatabaseOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
