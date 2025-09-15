package com.stjoseph.assessmentsystem.dto;

import java.util.List;

import com.stjoseph.assessmentsystem.model.Circular;

public class CircularRequest {
    
    private String title;
    private String body;
    private List<Circular.RecipientType> recipientTypes;
    
    // Default constructor
    public CircularRequest() {}
    
    // Constructor with parameters
    public CircularRequest(String title, String body, List<Circular.RecipientType> recipientTypes) {
        this.title = title;
        this.body = body;
        this.recipientTypes = recipientTypes;
    }
    
    // Getters and Setters
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
    
    public List<Circular.RecipientType> getRecipientTypes() {
        return recipientTypes;
    }
    
    public void setRecipientTypes(List<Circular.RecipientType> recipientTypes) {
        this.recipientTypes = recipientTypes;
    }
}
