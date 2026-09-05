package com.desk2dine.dto;

import jakarta.validation.constraints.NotBlank;

/** Admin create/update payload for a menu category. */
public class CategoryRequest {
    @NotBlank(message = "Category name is required")
    private String name;
    private String description;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
