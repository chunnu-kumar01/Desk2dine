package com.desk2dine.entity;

/** Maps to the `faculty` table — extra profile fields for a FACULTY user. */
public class FacultyProfile {
    private Long userId;
    private String department;
    private String designation;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
}
