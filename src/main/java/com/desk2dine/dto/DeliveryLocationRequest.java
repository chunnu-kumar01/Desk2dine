package com.desk2dine.dto;

import jakarta.validation.constraints.NotBlank;

/** Admin create/update payload for a delivery location. */
public class DeliveryLocationRequest {
    @NotBlank(message = "Location name is required")
    private String name;
    private String block;
    private String floor;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }
    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }
}
