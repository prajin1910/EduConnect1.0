package com.stjoseph.assessmentsystem.dto;

import java.time.LocalDate;

public class RoadmapRequest {
    private String taskName;
    private String description;
    private LocalDate dueDate;
    
    public RoadmapRequest() {}
    
    public String getTaskName() { return taskName; }
    public void setTaskName(String taskName) { this.taskName = taskName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}