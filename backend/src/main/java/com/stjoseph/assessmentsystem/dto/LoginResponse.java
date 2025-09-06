package com.stjoseph.assessmentsystem.dto;

public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String email;
    private String name;
    private String role;
    private String department;
    private String className;
    private String phoneNumber;
    private Boolean verified;
    
    public LoginResponse(String accessToken, String id, String email, String name, String role) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
    }
    
    public LoginResponse(String accessToken, String id, String email, String name, String role, 
                        String department, String className, String phoneNumber, Boolean verified) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.department = department;
        this.className = className;
        this.phoneNumber = phoneNumber;
        this.verified = verified;
    }
    
    // Getters and setters
    public String getAccessToken() { return token; }
    public void setAccessToken(String accessToken) { this.token = accessToken; }
    
    public String getTokenType() { return type; }
    public void setTokenType(String tokenType) { this.type = tokenType; }
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }
}