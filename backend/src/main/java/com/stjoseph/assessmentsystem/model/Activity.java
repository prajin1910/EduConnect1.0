package com.stjoseph.assessmentsystem.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "activities")
public class Activity {
    @Id
    private String id;
    
    private String userId;
    private LocalDate date;
    private ActivityType type;
    private String description;
    private LocalDateTime timestamp;
    
    public enum ActivityType {
        AI_ASSESSMENT, CLASS_ASSESSMENT, ASSESSMENT_COMPLETED, AI_CHAT, TASK_MANAGEMENT, ALUMNI_CHAT, PROFESSOR_CHAT, LOGIN, LOGOUT, PROFILE_UPDATE, CLASS_ATTENDANCE
    }
    
    public Activity() {
        this.timestamp = LocalDateTime.now();
        this.date = LocalDate.now();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    
    public ActivityType getType() { return type; }
    public void setType(ActivityType type) { this.type = type; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}