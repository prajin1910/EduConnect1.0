package com.stjoseph.assessmentsystem.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resumes")
public class Resume {
    @Id
    private String id;
    
    private String userId;
    private String fileName;
    private String originalFileName;
    private String filePath;
    private String fileType;
    private long fileSize;
    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;
    private boolean isActive;
    
    // Extracted resume content
    private String extractedText;
    
    // Parsed resume data
    private List<String> skills;
    private List<Experience> experiences;
    private List<Education> educations;
    private List<String> certifications;
    private String summary;
    private ContactInfo contactInfo;
    
    // ATS Analysis
    private ATSAnalysis atsAnalysis;
    
    // Management tracking
    private boolean sentToManagement;
    private LocalDateTime sentToManagementAt;
    
    public static class Experience {
        private String company;
        private String position;
        private String duration;
        private String description;
        private List<String> achievements;
        
        // Constructors
        public Experience() {}
        
        public Experience(String company, String position, String duration, String description) {
            this.company = company;
            this.position = position;
            this.duration = duration;
            this.description = description;
        }
        
        // Getters and Setters
        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }
        
        public String getPosition() { return position; }
        public void setPosition(String position) { this.position = position; }
        
        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public List<String> getAchievements() { return achievements; }
        public void setAchievements(List<String> achievements) { this.achievements = achievements; }
    }
    
    public static class Education {
        private String institution;
        private String degree;
        private String field;
        private String duration;
        private String grade;
        
        // Constructors
        public Education() {}
        
        public Education(String institution, String degree, String field, String duration) {
            this.institution = institution;
            this.degree = degree;
            this.field = field;
            this.duration = duration;
        }
        
        // Getters and Setters
        public String getInstitution() { return institution; }
        public void setInstitution(String institution) { this.institution = institution; }
        
        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }
        
        public String getField() { return field; }
        public void setField(String field) { this.field = field; }
        
        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }
        
        public String getGrade() { return grade; }
        public void setGrade(String grade) { this.grade = grade; }
    }
    
    public static class ContactInfo {
        private String email;
        private String phone;
        private String address;
        private String linkedin;
        private String github;
        private String portfolio;
        
        // Constructors
        public ContactInfo() {}
        
        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        
        public String getLinkedin() { return linkedin; }
        public void setLinkedin(String linkedin) { this.linkedin = linkedin; }
        
        public String getGithub() { return github; }
        public void setGithub(String github) { this.github = github; }
        
        public String getPortfolio() { return portfolio; }
        public void setPortfolio(String portfolio) { this.portfolio = portfolio; }
    }
    
    public static class ATSAnalysis {
        private String detailedSummary;
        private Integer overallScore;
        private Integer skillsScore;
        private Integer formattingScore;
        private Integer keywordsScore;
        private Integer experienceScore;
        private Integer educationScore;
        private List<String> feedback;
        private List<String> recommendations;
        private List<String> strengths;
        private List<String> weaknesses;
        private List<String> missingKeywords;
        private LocalDateTime analyzedAt;
        private boolean sentToManagement;
        private LocalDateTime sentAt;
        
        // Getters and Setters
        public String getDetailedSummary() { return detailedSummary; }
        public void setDetailedSummary(String detailedSummary) { this.detailedSummary = detailedSummary; }
        
        public Integer getOverallScore() { return overallScore; }
        public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }
        
        public Integer getSkillsScore() { return skillsScore; }
        public void setSkillsScore(Integer skillsScore) { this.skillsScore = skillsScore; }
        
        public Integer getFormattingScore() { return formattingScore; }
        public void setFormattingScore(Integer formattingScore) { this.formattingScore = formattingScore; }
        
        public Integer getKeywordsScore() { return keywordsScore; }
        public void setKeywordsScore(Integer keywordsScore) { this.keywordsScore = keywordsScore; }
        
        public Integer getExperienceScore() { return experienceScore; }
        public void setExperienceScore(Integer experienceScore) { this.experienceScore = experienceScore; }
        
        public Integer getEducationScore() { return educationScore; }
        public void setEducationScore(Integer educationScore) { this.educationScore = educationScore; }
        
        public List<String> getFeedback() { return feedback; }
        public void setFeedback(List<String> feedback) { this.feedback = feedback; }
        
        public List<String> getRecommendations() { return recommendations; }
        public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
        
        public List<String> getStrengths() { return strengths; }
        public void setStrengths(List<String> strengths) { this.strengths = strengths; }
        
        public List<String> getWeaknesses() { return weaknesses; }
        public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }
        
        public List<String> getMissingKeywords() { return missingKeywords; }
        public void setMissingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; }
        
        public LocalDateTime getAnalyzedAt() { return analyzedAt; }
        public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
        
        public boolean isSentToManagement() { return sentToManagement; }
        public void setSentToManagement(boolean sentToManagement) { this.sentToManagement = sentToManagement; }
        
        public LocalDateTime getSentAt() { return sentAt; }
        public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    }
    
    // Constructors
    public Resume() {
        this.uploadedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive = false; // Changed to false by default
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
    
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    
    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }
    
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    
    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
    
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    
    public List<Experience> getExperiences() { return experiences; }
    public void setExperiences(List<Experience> experiences) { this.experiences = experiences; }
    
    public List<Education> getEducations() { return educations; }
    public void setEducations(List<Education> educations) { this.educations = educations; }
    
    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> certifications) { this.certifications = certifications; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public ContactInfo getContactInfo() { return contactInfo; }
    public void setContactInfo(ContactInfo contactInfo) { this.contactInfo = contactInfo; }
    
    public ATSAnalysis getAtsAnalysis() { return atsAnalysis; }
    public void setAtsAnalysis(ATSAnalysis atsAnalysis) { this.atsAnalysis = atsAnalysis; }
    
    public boolean isSentToManagement() { return sentToManagement; }
    public void setSentToManagement(boolean sentToManagement) { this.sentToManagement = sentToManagement; }
    
    public LocalDateTime getSentToManagementAt() { return sentToManagementAt; }
    public void setSentToManagementAt(LocalDateTime sentToManagementAt) { this.sentToManagementAt = sentToManagementAt; }
}
