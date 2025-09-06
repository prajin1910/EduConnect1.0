package com.stjoseph.assessmentsystem.dto;

public class AIAssessmentRequest {
    private String domain;
    private String difficulty;
    private int numberOfQuestions;
    
    public AIAssessmentRequest() {}
    
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    
    public int getNumberOfQuestions() { return numberOfQuestions; }
    public void setNumberOfQuestions(int numberOfQuestions) { this.numberOfQuestions = numberOfQuestions; }
}