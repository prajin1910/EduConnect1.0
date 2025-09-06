package com.stjoseph.assessmentsystem.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "assessments")
public class Assessment {
    @Id
    private String id;
    
    private String title;
    private String description;
    private String createdBy;
    private List<String> assignedTo;
    private List<Question> questions;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;
    private AssessmentType type;
    private String domain;
    private String difficulty;
    private int totalMarks;
    private int duration; // in minutes
    
    public enum AssessmentType {
        AI_GENERATED, CLASS_ASSESSMENT
    }
    
    public static class Question {
        private String question;
        private List<String> options;
        private int correctAnswer;
        private String explanation;
        
        // Getters and Setters
        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
        
        public int getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(int correctAnswer) { this.correctAnswer = correctAnswer; }
        
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }
    
    public Assessment() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public List<String> getAssignedTo() { return assignedTo; }
    public void setAssignedTo(List<String> assignedTo) { this.assignedTo = assignedTo; }
    
    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public AssessmentType getType() { return type; }
    public void setType(AssessmentType type) { this.type = type; }
    
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    
    public int getTotalMarks() { return totalMarks; }
    public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }
    
    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }
}