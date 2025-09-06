package com.stjoseph.assessmentsystem.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.dto.AIAssessmentRequest;
import com.stjoseph.assessmentsystem.model.Assessment;
import com.stjoseph.assessmentsystem.model.AssessmentResult;
import com.stjoseph.assessmentsystem.service.AssessmentService;

@RestController
@RequestMapping("/assessments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssessmentController {
    
    @Autowired
    private AssessmentService assessmentService;
    
    @GetMapping("/search-students")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<?> searchStudents(@RequestParam String query) {
        try {
            List<Map<String, Object>> students = assessmentService.searchStudents(query);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{assessmentId}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<?> updateAssessment(@PathVariable String assessmentId, 
                                            @RequestBody Assessment assessment, 
                                            Authentication auth) {
        try {
            Assessment updated = assessmentService.updateAssessment(assessmentId, assessment, auth.getName());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/generate-ai")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_PROFESSOR')")
    public ResponseEntity<?> generateAIAssessment(@RequestBody AIAssessmentRequest request, Authentication auth) {
        try {
            Assessment assessment = assessmentService.generateAIAssessment(request, auth.getName());
            return ResponseEntity.ok(assessment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<?> createAssessment(@RequestBody Assessment assessment, Authentication auth) {
        try {
            Assessment created = assessmentService.createAssessment(assessment, auth.getName());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/student")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<?> getStudentAssessments(Authentication auth) {
        try {
            List<Assessment> assessments = assessmentService.getStudentAssessments(auth.getName());
            return ResponseEntity.ok(assessments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/professor")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<?> getProfessorAssessments(Authentication auth) {
        try {
            List<Assessment> assessments = assessmentService.getProfessorAssessments(auth.getName());
            return ResponseEntity.ok(assessments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/{assessmentId}/submit")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<?> submitAssessment(@PathVariable String assessmentId, 
                                            @RequestBody Map<String, Object> submission, 
                                            Authentication auth) {
        try {
            // Log the submission attempt for debugging
            System.out.println("Assessment submission attempt:");
            System.out.println("Assessment ID: " + assessmentId);
            System.out.println("User: " + auth.getName());
            System.out.println("Submission data keys: " + submission.keySet());
            System.out.println("Full submission: " + submission);
            
            // Validate required fields
            if (!submission.containsKey("answers")) {
                return ResponseEntity.badRequest().body("Missing 'answers' field in submission");
            }
            
            if (!submission.containsKey("startedAt")) {
                return ResponseEntity.badRequest().body("Missing 'startedAt' field in submission");
            }
            
            AssessmentResult result = assessmentService.submitAssessment(assessmentId, submission, auth.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Assessment submission error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/{assessmentId}/results")
    @PreAuthorize("hasAnyAuthority('ROLE_PROFESSOR', 'ROLE_STUDENT')")
    public ResponseEntity<?> getAssessmentResults(@PathVariable String assessmentId, Authentication auth) {
        try {
            List<AssessmentResult> results = assessmentService.getAssessmentResults(assessmentId, auth.getName());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}