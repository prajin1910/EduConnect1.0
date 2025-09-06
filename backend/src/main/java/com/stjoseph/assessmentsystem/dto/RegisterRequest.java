package com.stjoseph.assessmentsystem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {
    @NotBlank
    private String name;
    
    @NotBlank
    @Email
    private String email;
    
    private String password;
    
    @NotBlank
    private String phoneNumber;
    
    @NotBlank
    private String department;
    
    private String className;
    
    @NotBlank
    private String role;
    
    // Alumni specific fields
    private String graduationYear;
    private String batch;
    private String placedCompany;
    
    public RegisterRequest() {}
    
    // Getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getGraduationYear() { return graduationYear; }
    public void setGraduationYear(String graduationYear) { this.graduationYear = graduationYear; }
    
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    
    public String getPlacedCompany() { return placedCompany; }
    public void setPlacedCompany(String placedCompany) { this.placedCompany = placedCompany; }
}