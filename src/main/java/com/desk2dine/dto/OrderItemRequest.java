package com.desk2dine.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** One requested line item within CreateOrderRequest: a menu item id + quantity. */
public class OrderItemRequest {
    @NotNull(message = "Menu item is required")
    private Long menuItemId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    public Long getMenuItemId() { return menuItemId; }
    public void setMenuItemId(Long menuItemId) { this.menuItemId = menuItemId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
