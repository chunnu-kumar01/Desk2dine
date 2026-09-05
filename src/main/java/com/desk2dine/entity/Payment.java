package com.desk2dine.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Maps to the `payments` table — one payment record per order. */
public class Payment {
    private Long id;
    private Long orderId;
    private Long billNumber;
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentStatus; // PENDING, PAID
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getBillNumber() { return billNumber; }
    public void setBillNumber(Long billNumber) { this.billNumber = billNumber; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
