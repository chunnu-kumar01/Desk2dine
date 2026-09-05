package com.desk2dine.exception;

/** Thrown when a requested row (order, menu item, user, ...) does not exist. */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
