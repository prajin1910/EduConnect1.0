package com.stjoseph.assessmentsystem.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "tasks")
public class Task {
    @Id
    private String id;
    
    private String userId;
    private String taskName;
    private String description;
    private LocalDate dueDate;
    private TaskStatus status;
    private LocalDateTime createdAt;
    private List<String> roadmap;
    private boolean roadmapGenerated;
    
    public enum TaskStatus {
        PENDING, IN_PROGRESS, COMPLETED, OVERDUE
    }
    
    public Task() {
        this.createdAt = LocalDateTime.now();
        this.status = TaskStatus.PENDING;
        this.roadmapGenerated = false;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getTaskName() { return taskName; }
    public void setTaskName(String taskName) { this.taskName = taskName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    
    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public List<String> getRoadmap() { return roadmap; }
    public void setRoadmap(List<String> roadmap) { this.roadmap = roadmap; }
    
    public boolean isRoadmapGenerated() { return roadmapGenerated; }
    public void setRoadmapGenerated(boolean roadmapGenerated) { this.roadmapGenerated = roadmapGenerated; }
}