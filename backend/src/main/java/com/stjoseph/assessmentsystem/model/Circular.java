package com.stjoseph.assessmentsystem.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "circulars")
public class Circular {
    @Id
    private String id;
    private String title;
    private String body;
    private String senderId;
    private String senderName;
    private SenderRole senderRole;
    private List<RecipientType> recipientTypes;
    private List<String> recipients; // List of user IDs who should receive this circular
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private CircularStatus status;
    private List<String> readBy; // List of user IDs who have read this circular

    public enum SenderRole {
        MANAGEMENT, PROFESSOR, STUDENT
    }

    public enum RecipientType {
        STUDENTS, PROFESSORS, MANAGEMENT, ALL
    }

    public enum CircularStatus {
        ACTIVE, ARCHIVED, DRAFT
    }

    // Default constructor
    public Circular() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = CircularStatus.ACTIVE;
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

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public SenderRole getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(SenderRole senderRole) {
        this.senderRole = senderRole;
    }

    public List<RecipientType> getRecipientTypes() {
        return recipientTypes;
    }

    public void setRecipientTypes(List<RecipientType> recipientTypes) {
        this.recipientTypes = recipientTypes;
    }

    public List<String> getRecipients() {
        return recipients;
    }

    public void setRecipients(List<String> recipients) {
        this.recipients = recipients;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public CircularStatus getStatus() {
        return status;
    }

    public void setStatus(CircularStatus status) {
        this.status = status;
    }

    public List<String> getReadBy() {
        return readBy;
    }

    public void setReadBy(List<String> readBy) {
        this.readBy = readBy;
    }
}
