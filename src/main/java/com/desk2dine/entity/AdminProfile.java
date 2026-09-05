package com.desk2dine.entity;

/** Maps to the `admin` table — extra profile fields for an ADMIN user. */
public class AdminProfile {
    private Long userId;
    private String adminLevel;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getAdminLevel() { return adminLevel; }
    public void setAdminLevel(String adminLevel) { this.adminLevel = adminLevel; }
}
