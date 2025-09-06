package com.stjoseph.assessmentsystem.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "assessment_results")
public class AssessmentResult {
    @Id
    private String id;
    
    private String assessmentId;
    private String studentId;
    private String studentName;
    private List<Answer> answers;
    private int score;
    private int totalMarks;
    private double percentage;
    private LocalDateTime submittedAt;
    private LocalDateTime startedAt;
    private long timeTaken; // in seconds
    private List<Feedback> feedback;
    
    public static class Answer {
        private int questionIndex;
        private int selectedAnswer;
        private boolean isCorrect;
        
        // Getters and Setters
        public int getQuestionIndex() { return questionIndex; }
        public void setQuestionIndex(int questionIndex) { this.questionIndex = questionIndex; }
        
        public int getSelectedAnswer() { return selectedAnswer; }
        public void setSelectedAnswer(int selectedAnswer) { this.selectedAnswer = selectedAnswer; }
        
        public boolean isCorrect() { return isCorrect; }
        public void setCorrect(boolean correct) { isCorrect = correct; }
    }
    
    public static class Feedback {
        private int questionIndex;
        private String question;
        private String selectedOption;
        private String correctOption;
        private String explanation;
        private boolean isCorrect;
        
        // Getters and Setters
        public int getQuestionIndex() { return questionIndex; }
        public void setQuestionIndex(int questionIndex) { this.questionIndex = questionIndex; }
        
        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        
        public String getSelectedOption() { return selectedOption; }
        public void setSelectedOption(String selectedOption) { this.selectedOption = selectedOption; }
        
        public String getCorrectOption() { return correctOption; }
        public void setCorrectOption(String correctOption) { this.correctOption = correctOption; }
        
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
        
        public boolean isCorrect() { return isCorrect; }
        public void setCorrect(boolean correct) { isCorrect = correct; }
    }
    
    public AssessmentResult() {
        this.submittedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getAssessmentId() { return assessmentId; }
    public void setAssessmentId(String assessmentId) { this.assessmentId = assessmentId; }
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    
    public List<Answer> getAnswers() { return answers; }
    public void setAnswers(List<Answer> answers) { this.answers = answers; }
    
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    
    public int getTotalMarks() { return totalMarks; }
    public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }
    
    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
    
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    
    public long getTimeTaken() { return timeTaken; }
    public void setTimeTaken(long timeTaken) { this.timeTaken = timeTaken; }
    
    public List<Feedback> getFeedback() { return feedback; }
    public void setFeedback(List<Feedback> feedback) { this.feedback = feedback; }
}