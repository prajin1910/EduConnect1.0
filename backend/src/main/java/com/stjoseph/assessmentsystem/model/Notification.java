package com.stjoseph.assessmentsystem.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {
    
    @Id
    private String id;
    
    private String title;
    private String message;
    private NotificationType type;
    private String eventId;
    private String eventTitle;
    private String organizerName;
    private LocalDateTime eventDate;
    private String relatedEntityId; // For connections, this would be the other user's ID
    private LocalDateTime createdAt;
    private List<String> recipients; // User IDs who should receive this notification
    private List<String> readBy; // User IDs who have read this notification
    
    public enum NotificationType {
        EVENT_APPROVED,
        EVENT_REJECTED, 
        EVENT_UPCOMING,
        EVENT_REMINDER,
        CONNECTION_REQUEST,
        CONNECTION_ACCEPTED,
        NEW_FOLLOWER,
        JOB_POST
    }    // Constructors
    public Notification() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Notification(String title, String message, NotificationType type) {
        this();
        this.title = title;
        this.message = message;
        this.type = type;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public NotificationType getType() {
        return type;
    }
    
    public void setType(NotificationType type) {
        this.type = type;
    }
    
    public String getEventId() {
        return eventId;
    }
    
    public void setEventId(String eventId) {
        this.eventId = eventId;
    }
    
    public String getEventTitle() {
        return eventTitle;
    }
    
    public void setEventTitle(String eventTitle) {
        this.eventTitle = eventTitle;
    }
    
    public String getOrganizerName() {
        return organizerName;
    }
    
    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }
    
    public LocalDateTime getEventDate() {
        return eventDate;
    }
    
    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<String> getRecipients() {
        return recipients;
    }
    
    public void setRecipients(List<String> recipients) {
        this.recipients = recipients;
    }
    
    public List<String> getReadBy() {
        return readBy;
    }
    
    public void setReadBy(List<String> readBy) {
        this.readBy = readBy;
    }
    
    public String getRelatedEntityId() {
        return relatedEntityId;
    }
    
    public void setRelatedEntityId(String relatedEntityId) {
        this.relatedEntityId = relatedEntityId;
    }
}
