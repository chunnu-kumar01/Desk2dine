package com.desk2dine.entity;

/** The order lifecycle, stored as a plain VARCHAR in the `orders.status` column. */
public enum OrderStatus {
    PLACED,
    DELIVERED,
    RECEIVED,
    BILLED,
    PAID,
    COMPLETED
}
