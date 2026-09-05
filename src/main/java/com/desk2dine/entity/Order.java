package com.desk2dine.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Maps to the `orders` table — the parent row for a faculty order.
 * Line items live separately in `order_items` (see OrderItem) and are
 * attached here as a list after being fetched by OrderItemRepository.
 */
public class Order {
    private Long id;
    private Long userId;
    private String facultyName;     // populated by JOIN with users, not a real column
    private Long deliveryLocationId;
    private String deliveryLocationName; // populated by JOIN with delivery_locations
    private OrderStatus status;
    private BigDecimal totalAmount;
    private Long billNumber;
    private LocalDateTime orderTime;
    private LocalDateTime deliveredTime;
    private LocalDateTime receivedTime;
    private LocalDateTime billedTime;
    private LocalDateTime paidTime;
    private LocalDateTime completedTime;
    private List<OrderItem> items = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }
    public Long getDeliveryLocationId() { return deliveryLocationId; }
    public void setDeliveryLocationId(Long deliveryLocationId) { this.deliveryLocationId = deliveryLocationId; }
    public String getDeliveryLocationName() { return deliveryLocationName; }
    public void setDeliveryLocationName(String deliveryLocationName) { this.deliveryLocationName = deliveryLocationName; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public Long getBillNumber() { return billNumber; }
    public void setBillNumber(Long billNumber) { this.billNumber = billNumber; }
    public LocalDateTime getOrderTime() { return orderTime; }
    public void setOrderTime(LocalDateTime orderTime) { this.orderTime = orderTime; }
    public LocalDateTime getDeliveredTime() { return deliveredTime; }
    public void setDeliveredTime(LocalDateTime deliveredTime) { this.deliveredTime = deliveredTime; }
    public LocalDateTime getReceivedTime() { return receivedTime; }
    public void setReceivedTime(LocalDateTime receivedTime) { this.receivedTime = receivedTime; }
    public LocalDateTime getBilledTime() { return billedTime; }
    public void setBilledTime(LocalDateTime billedTime) { this.billedTime = billedTime; }
    public LocalDateTime getPaidTime() { return paidTime; }
    public void setPaidTime(LocalDateTime paidTime) { this.paidTime = paidTime; }
    public LocalDateTime getCompletedTime() { return completedTime; }
    public void setCompletedTime(LocalDateTime completedTime) { this.completedTime = completedTime; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
