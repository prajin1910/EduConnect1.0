package com.stjoseph.assessmentsystem.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "alumni_profiles")
public class AlumniProfile {
    @Id
    private String id;
    
    private String userId; // Reference to User ID
    private String currentJob;
    private String company;
    private String location;
    private String bio;
    private List<String> skills;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private boolean isAvailableForMentorship;
    private String experience; // Years of experience
    private List<String> achievements;
    private String profilePicture;
    private LocalDateTime updatedAt;
    
    public AlumniProfile() {
        this.updatedAt = LocalDateTime.now();
        this.isAvailableForMentorship = false;
    }
    
    public AlumniProfile(String userId) {
        this();
        this.userId = userId;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getCurrentJob() { return currentJob; }
    public void setCurrentJob(String currentJob) { this.currentJob = currentJob; }
    
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    
    public boolean isAvailableForMentorship() { return isAvailableForMentorship; }
    public void setAvailableForMentorship(boolean availableForMentorship) { 
        this.isAvailableForMentorship = availableForMentorship; 
    }
    
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    
    public List<String> getAchievements() { return achievements; }
    public void setAchievements(List<String> achievements) { this.achievements = achievements; }
    
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
