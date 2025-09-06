package com.stjoseph.assessmentsystem.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "connections")
public class Connection {
    @Id
    private String id;
    
    private String senderId;
    private String recipientId;
    private String message;
    private ConnectionStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
    
    public enum ConnectionStatus {
        PENDING, ACCEPTED, REJECTED
    }
    
    public Connection() {
        this.requestedAt = LocalDateTime.now();
        this.status = ConnectionStatus.PENDING;
    }
    
    public Connection(String senderId, String recipientId, String message) {
        this();
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.message = message;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    
    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public ConnectionStatus getStatus() { return status; }
    public void setStatus(ConnectionStatus status) { this.status = status; }
    
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
    
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
}
