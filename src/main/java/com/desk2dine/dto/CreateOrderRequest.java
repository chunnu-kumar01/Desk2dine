package com.desk2dine.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/** What the "Place Order" screen submits: a delivery location + one or more items. */
public class CreateOrderRequest {
    @NotNull(message = "Delivery location is required")
    private Long deliveryLocationId;

    @NotEmpty(message = "Select at least one menu item")
    @Valid
    private List<OrderItemRequest> items;

    public Long getDeliveryLocationId() { return deliveryLocationId; }
    public void setDeliveryLocationId(Long deliveryLocationId) { this.deliveryLocationId = deliveryLocationId; }
    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
}
