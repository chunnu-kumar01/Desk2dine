package com.desk2dine.entity;

/** Maps to the `delivery_locations` table. */
public class DeliveryLocation {
    private Long id;
    private String name;
    private String block;
    private String floor;
    private boolean active;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }
    public String getFloor() { return floor; }
    public void setFloor(String floor) { this.floor = floor; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
