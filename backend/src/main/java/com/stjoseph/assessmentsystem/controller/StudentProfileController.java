package com.stjoseph.assessmentsystem.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.UserRepository;
import com.stjoseph.assessmentsystem.service.UserService;

@RestController
@RequestMapping("/students")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentProfileController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getStudentProfile(@PathVariable String userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            if (!user.getRole().equals(User.UserRole.STUDENT)) {
                return ResponseEntity.badRequest().body("User is not a student");
            }

            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("name", user.getName());
            profile.put("email", user.getEmail());
            profile.put("phone", user.getPhone());
            profile.put("profilePicture", user.getProfilePicture());
            profile.put("studentId", user.getStudentId());
            profile.put("course", user.getCourse());
            profile.put("year", user.getYear());
            profile.put("semester", user.getSemester());
            profile.put("department", user.getDepartment());
            profile.put("cgpa", user.getCgpa());
            profile.put("bio", user.getBio());
            profile.put("skills", user.getSkills());
            profile.put("location", user.getLocation());
            profile.put("joinDate", user.getCreatedAt());
            profile.put("lastActive", user.getLastActive());
            profile.put("overallPerformance", calculatePerformance(user.getCgpa()));
            
            // Add AI assessment count and connection count
            profile.put("aiAssessmentCount", user.getAiAssessmentCount() != null ? user.getAiAssessmentCount() : 0);
            profile.put("connectionCount", user.getConnectionCount() != null ? user.getConnectionCount() : 0);

            // Add mock assessment scores for demonstration
            profile.put("assessmentScores", generateMockAssessmentScores());

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get student profile: " + e.getMessage());
        }
    }

    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(@RequestHeader("Authorization") String token) {
        try {
            String userId = userService.getUserIdFromToken(token);
            return getStudentProfile(userId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get profile: " + e.getMessage());
        }
    }

    @PutMapping("/my-profile")
    public ResponseEntity<?> updateMyProfile(@RequestHeader("Authorization") String token, 
                                           @RequestBody Map<String, Object> profileData) {
        try {
            String userId = userService.getUserIdFromToken(token);
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            
            // Update allowed fields
            if (profileData.containsKey("bio")) {
                user.setBio((String) profileData.get("bio"));
            }
            if (profileData.containsKey("skills")) {
                user.setSkills((java.util.List<String>) profileData.get("skills"));
            }
            if (profileData.containsKey("location")) {
                user.setLocation((String) profileData.get("location"));
            }
            if (profileData.containsKey("phone")) {
                user.setPhone((String) profileData.get("phone"));
            }

            userRepository.save(user);
            
            return ResponseEntity.ok().body("Profile updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update profile: " + e.getMessage());
        }
    }

    @GetMapping("/assessment-history/{userId}")
    public ResponseEntity<?> getAssessmentHistory(@PathVariable String userId) {
        try {
            // For now, return mock data
            return ResponseEntity.ok(generateMockAssessmentScores());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get assessment history: " + e.getMessage());
        }
    }

    @GetMapping("/my-assessment-history")
    public ResponseEntity<?> getMyAssessmentHistory(@RequestHeader("Authorization") String token) {
        try {
            String userId = userService.getUserIdFromToken(token);
            return getAssessmentHistory(userId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get assessment history: " + e.getMessage());
        }
    }

    private String calculatePerformance(Double cgpa) {
        if (cgpa == null) return "N/A";
        if (cgpa >= 9.0) return "Excellent";
        if (cgpa >= 8.0) return "Very Good";
        if (cgpa >= 7.0) return "Good";
        if (cgpa >= 6.0) return "Average";
        return "Below Average";
    }

    private java.util.List<Map<String, Object>> generateMockAssessmentScores() {
        java.util.List<Map<String, Object>> scores = new java.util.ArrayList<>();
        
        Map<String, Object> assessment1 = new HashMap<>();
        assessment1.put("assessmentName", "Data Structures Mid-term");
        assessment1.put("subject", "Data Structures");
        assessment1.put("score", 85);
        assessment1.put("maxScore", 100);
        assessment1.put("percentage", 85);
        assessment1.put("date", "2025-07-15");
        assessment1.put("grade", "A");
        scores.add(assessment1);

        Map<String, Object> assessment2 = new HashMap<>();
        assessment2.put("assessmentName", "Java Programming Quiz");
        assessment2.put("subject", "Programming");
        assessment2.put("score", 92);
        assessment2.put("maxScore", 100);
        assessment2.put("percentage", 92);
        assessment2.put("date", "2025-07-22");
        assessment2.put("grade", "A+");
        scores.add(assessment2);

        Map<String, Object> assessment3 = new HashMap<>();
        assessment3.put("assessmentName", "Database Final");
        assessment3.put("subject", "Database Management");
        assessment3.put("score", 78);
        assessment3.put("maxScore", 100);
        assessment3.put("percentage", 78);
        assessment3.put("date", "2025-08-10");
        assessment3.put("grade", "B+");
        scores.add(assessment3);

        return scores;
    }
}
