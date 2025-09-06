package com.stjoseph.assessmentsystem.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stjoseph.assessmentsystem.dto.AIAssessmentRequest;
import com.stjoseph.assessmentsystem.model.Assessment;
import com.stjoseph.assessmentsystem.model.AssessmentResult;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.AssessmentRepository;
import com.stjoseph.assessmentsystem.repository.AssessmentResultRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;

@Service
public class AssessmentService {
    
    @Autowired
    private AssessmentRepository assessmentRepository;
    
    @Autowired
    private AssessmentResultRepository resultRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AIService aiService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private ActivityService activityService;
    
    public List<Map<String, Object>> searchStudents(String query) {
        List<User> students;
        
        if (query.contains("@")) {
            // Full email search
            students = userRepository.findByEmailContainingIgnoreCase(query);
        } else {
            // Partial email search (before @) or name search
            students = userRepository.findByEmailStartingWithIgnoreCase(query + "@");
            
            // Also search by name if no email results
            if (students.isEmpty()) {
                students = userRepository.findByNameContainingIgnoreCase(query);
            }
        }
        
        // Filter only students and verified users
        students = students.stream()
                .filter(user -> user.getRole() == User.UserRole.STUDENT && user.isVerified())
                .collect(Collectors.toList());
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (User student : students) {
            Map<String, Object> studentMap = new HashMap<>();
            studentMap.put("id", student.getId());
            studentMap.put("name", student.getName());
            studentMap.put("email", student.getEmail());
            studentMap.put("className", student.getClassName());
            studentMap.put("department", student.getDepartment());
            result.add(studentMap);
        }
        
        return result;
    }
    
    public Assessment updateAssessment(String assessmentId, Assessment updatedAssessment, String professorEmail) {
        User professor = userRepository.findByEmail(professorEmail)
                .orElseThrow(() -> new RuntimeException("Professor not found"));
        
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));
        
        // Verify ownership
        if (!assessment.getCreatedBy().equals(professor.getId())) {
            throw new RuntimeException("You can only edit your own assessments");
        }
        
        // Update allowed fields
        assessment.setTitle(updatedAssessment.getTitle());
        assessment.setDescription(updatedAssessment.getDescription());
        assessment.setStartTime(updatedAssessment.getStartTime());
        assessment.setEndTime(updatedAssessment.getEndTime());
        
        return assessmentRepository.save(assessment);
    }
    
    public Assessment generateAIAssessment(AIAssessmentRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Assessment assessment = aiService.generateAssessment(request);
        assessment.setCreatedBy(user.getId());
        assessment.setType(Assessment.AssessmentType.AI_GENERATED);
        
        Assessment saved = assessmentRepository.save(assessment);
        
        // Increment AI assessment count for student
        if (user.getRole() == User.UserRole.STUDENT) {
            Integer currentCount = user.getAiAssessmentCount() != null ? user.getAiAssessmentCount() : 0;
            user.setAiAssessmentCount(currentCount + 1);
            userRepository.save(user);
            System.out.println("Incremented AI assessment count for student: " + user.getName() + " to " + (currentCount + 1));
        }
        
        // Log activity
        activityService.logActivityByUserId(user.getId(), "AI_ASSESSMENT", 
                "Generated AI assessment: " + assessment.getTitle());
        
        return saved;
    }
    
    public Assessment createAssessment(Assessment assessment, String professorEmail) {
        User professor = userRepository.findByEmail(professorEmail)
                .orElseThrow(() -> new RuntimeException("Professor not found"));
        
        assessment.setCreatedBy(professor.getId());
        assessment.setType(Assessment.AssessmentType.CLASS_ASSESSMENT);
        assessment.setCreatedAt(LocalDateTime.now());
        
        Assessment saved = assessmentRepository.save(assessment);
        
        // Log activity (removed for simplicity)
        System.out.println("AssessmentService: New assessment created: " + assessment.getTitle() + " by " + professor.getName());
        
        // Send email notifications to assigned students
        if (assessment.getAssignedTo() != null) {
            for (String studentId : assessment.getAssignedTo()) {
                User student = userRepository.findById(studentId).orElse(null);
                if (student != null) {
                    emailService.sendAssessmentNotification(
                            student.getEmail(),
                            assessment.getTitle(),
                            assessment.getStartTime().toString()
                    );
                }
            }
        }
        
        return saved;
    }
    
    public List<Assessment> getStudentAssessments(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        return assessmentRepository.findByAssignedToContaining(student.getId());
    }
    
    public List<Assessment> getProfessorAssessments(String professorEmail) {
        User professor = userRepository.findByEmail(professorEmail)
                .orElseThrow(() -> new RuntimeException("Professor not found"));
        
        return assessmentRepository.findByCreatedBy(professor.getId());
    }
    
    public AssessmentResult submitAssessment(String assessmentId, Map<String, Object> submission, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));
        
        // Check if already submitted
        if (resultRepository.findByAssessmentIdAndStudentId(assessmentId, student.getId()).isPresent()) {
            throw new RuntimeException("Assessment already submitted");
        }
        
        // Validate that student is assigned to this assessment
        if (!assessment.getAssignedTo().contains(student.getId())) {
            throw new RuntimeException("You are not assigned to this assessment");
        }
        
        // Check if assessment is still active
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(assessment.getStartTime())) {
            throw new RuntimeException("Assessment has not started yet");
        }
        if (now.isAfter(assessment.getEndTime())) {
            throw new RuntimeException("Assessment has ended");
        }
        
        List<Map<String, Object>> answers;
        LocalDateTime startedAt;
        
        try {
            // Extract and validate answers
            Object answersObj = submission.get("answers");
            if (answersObj == null) {
                throw new RuntimeException("Missing 'answers' field in submission");
            }
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> rawAnswers = (List<Map<String, Object>>) answersObj;
            answers = rawAnswers;
            
            // Extract and validate startedAt
            Object startedAtObj = submission.get("startedAt");
            if (startedAtObj == null) {
                throw new RuntimeException("Missing 'startedAt' field in submission");
            }
            
            String startedAtStr = (String) startedAtObj;
            if (startedAtStr == null || startedAtStr.trim().isEmpty()) {
                throw new RuntimeException("Invalid 'startedAt' value");
            }
            
            // Handle different timestamp formats (with or without timezone)
            if (startedAtStr.endsWith("Z")) {
                // Convert UTC timestamp to LocalDateTime
                startedAt = java.time.Instant.parse(startedAtStr).atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
            } else if (startedAtStr.contains("+") || startedAtStr.matches(".*-\\d{2}:\\d{2}$")) {
                // Handle timezone offset format
                startedAt = java.time.OffsetDateTime.parse(startedAtStr).toLocalDateTime();
            } else {
                // Assume local datetime format
                startedAt = LocalDateTime.parse(startedAtStr);
            }
            
            // Validate answers array
            if (answers == null || answers.isEmpty()) {
                throw new RuntimeException("No answers provided");
            }
            
            if (answers.size() != assessment.getQuestions().size()) {
                throw new RuntimeException("Answer count (" + answers.size() + ") does not match question count (" + assessment.getQuestions().size() + ")");
            }
            
            // Validate each answer structure
            for (int i = 0; i < answers.size(); i++) {
                Map<String, Object> answer = answers.get(i);
                if (answer == null) {
                    throw new RuntimeException("Answer at index " + i + " is null");
                }
                
                if (!answer.containsKey("questionIndex")) {
                    throw new RuntimeException("Answer at index " + i + " missing 'questionIndex'");
                }
                
                if (!answer.containsKey("selectedAnswer")) {
                    throw new RuntimeException("Answer at index " + i + " missing 'selectedAnswer'");
                }
                
                // Validate questionIndex
                Object questionIndexObj = answer.get("questionIndex");
                int questionIndex;
                if (questionIndexObj instanceof Integer) {
                    questionIndex = (Integer) questionIndexObj;
                } else if (questionIndexObj instanceof String) {
                    try {
                        questionIndex = Integer.parseInt((String) questionIndexObj);
                    } catch (NumberFormatException e) {
                        throw new RuntimeException("Invalid questionIndex at answer " + i + ": " + questionIndexObj);
                    }
                } else {
                    throw new RuntimeException("Invalid questionIndex type at answer " + i + ": " + questionIndexObj);
                }
                
                if (questionIndex != i) {
                    throw new RuntimeException("Question index mismatch at position " + i + ": expected " + i + " but got " + questionIndex);
                }
            }
            
        } catch (ClassCastException e) {
            throw new RuntimeException("Invalid submission format. Expected answers to be a list of objects: " + e.getMessage());
        } catch (java.time.format.DateTimeParseException e) {
            throw new RuntimeException("Invalid startedAt timestamp format: " + e.getMessage());
        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Invalid submission format: " + e.getMessage());
        }
        
        AssessmentResult result = new AssessmentResult();
        result.setAssessmentId(assessmentId);
        result.setStudentId(student.getId());
        result.setStudentName(student.getName());
        result.setStartedAt(startedAt);
        result.setTimeTaken(ChronoUnit.SECONDS.between(startedAt, LocalDateTime.now()));
        
        // Calculate score and feedback
        List<AssessmentResult.Answer> resultAnswers = new ArrayList<>();
        List<AssessmentResult.Feedback> feedback = new ArrayList<>();
        int score = 0;
        
        for (int i = 0; i < answers.size(); i++) {
            Map<String, Object> answer = answers.get(i);
            
            // Ensure we don't go out of bounds
            if (i >= assessment.getQuestions().size()) {
                break;
            }
            
            Assessment.Question question = assessment.getQuestions().get(i);
            
            int selectedAnswer;
            try {
                Object selectedObj = answer.get("selectedAnswer");
                if (selectedObj instanceof Integer) {
                    selectedAnswer = (Integer) selectedObj;
                } else if (selectedObj instanceof String) {
                    selectedAnswer = Integer.parseInt((String) selectedObj);
                } else {
                    selectedAnswer = -1; // Not answered
                }
                
                // Validate selected answer is within valid range
                if (selectedAnswer >= 0 && selectedAnswer >= question.getOptions().size()) {
                    selectedAnswer = -1; // Invalid answer, treat as not answered
                }
            } catch (Exception e) {
                selectedAnswer = -1; // Not answered
            }
            
            boolean isCorrect = selectedAnswer == question.getCorrectAnswer();
            
            if (isCorrect) score++;
            
            AssessmentResult.Answer resultAnswer = new AssessmentResult.Answer();
            resultAnswer.setQuestionIndex(i);
            resultAnswer.setSelectedAnswer(selectedAnswer);
            resultAnswer.setCorrect(isCorrect);
            resultAnswers.add(resultAnswer);
            
            AssessmentResult.Feedback feedbackItem = new AssessmentResult.Feedback();
            feedbackItem.setQuestionIndex(i);
            feedbackItem.setQuestion(question.getQuestion());
            feedbackItem.setSelectedOption(selectedAnswer >= 0 && selectedAnswer < question.getOptions().size() ? 
                question.getOptions().get(selectedAnswer) : "Not answered");
            feedbackItem.setCorrectOption(question.getOptions().get(question.getCorrectAnswer()));
            feedbackItem.setExplanation(question.getExplanation());
            feedbackItem.setCorrect(isCorrect);
            feedback.add(feedbackItem);
        }
        
        result.setAnswers(resultAnswers);
        result.setFeedback(feedback);
        result.setScore(score);
        result.setTotalMarks(assessment.getQuestions().size());
        result.setPercentage((double) score / assessment.getQuestions().size() * 100);
        
        AssessmentResult saved = resultRepository.save(result);
        
        // Increment AI assessment count for student when they complete an AI assessment
        if (assessment.getType() == Assessment.AssessmentType.AI_GENERATED && student.getRole() == User.UserRole.STUDENT) {
            Integer currentCount = student.getAiAssessmentCount() != null ? student.getAiAssessmentCount() : 0;
            student.setAiAssessmentCount(currentCount + 1);
            userRepository.save(student);
            System.out.println("Incremented AI assessment completion count for student: " + student.getName() + " to " + (currentCount + 1));
        }
        
        // Log activity
        try {
            activityService.logActivityByUserId(student.getId(), "ASSESSMENT_COMPLETED", 
                    "Completed assessment: " + assessment.getTitle() + " - Score: " + score + "/" + assessment.getQuestions().size());
            System.out.println("AssessmentService: Activity logged for student: " + student.getId());
        } catch (Exception e) {
            System.err.println("Failed to log activity: " + e.getMessage());
            e.printStackTrace();
        }
        
        return saved;
    }
    
    public List<AssessmentResult> getAssessmentResults(String assessmentId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() == User.UserRole.STUDENT) {
            AssessmentResult result = resultRepository.findByAssessmentIdAndStudentId(assessmentId, user.getId())
                    .orElse(null);
            return result != null ? List.of(result) : new ArrayList<>();
        } else {
            return resultRepository.findByAssessmentId(assessmentId);
        }
    }
}