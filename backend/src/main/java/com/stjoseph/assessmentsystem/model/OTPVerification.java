package com.stjoseph.assessmentsystem.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "otp_verifications")
public class OTPVerification {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String email;
    
    private String otp;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean verified;
    private OTPType type;
    
    public enum OTPType {
        REGISTRATION, PASSWORD_RESET
    }
    
    public OTPVerification() {
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusMinutes(5);
        this.verified = false;
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    
    public OTPType getType() { return type; }
    public void setType(OTPType type) { this.type = type; }
}