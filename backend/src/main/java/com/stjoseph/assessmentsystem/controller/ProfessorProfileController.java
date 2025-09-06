package com.stjoseph.assessmentsystem.controller;

import java.util.ArrayList;
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
@RequestMapping("/professors")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfessorProfileController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfessorProfile(@PathVariable String userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            if (!user.getRole().equals(User.UserRole.PROFESSOR)) {
                return ResponseEntity.badRequest().body("User is not a professor");
            }

            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("name", user.getName());
            profile.put("email", user.getEmail());
            profile.put("phone", user.getPhone());
            profile.put("profilePicture", user.getProfilePicture());
            profile.put("employeeId", user.getEmployeeId());
            profile.put("designation", user.getDesignation());
            profile.put("department", user.getDepartment());
            profile.put("experience", user.getExperience());
            profile.put("subjectsTeaching", user.getSubjectsTeaching() != null ? user.getSubjectsTeaching() : new ArrayList<>());
            profile.put("researchInterests", user.getResearchInterests() != null ? user.getResearchInterests() : new ArrayList<>());
            profile.put("publications", user.getPublications());
            profile.put("studentsSupervised", user.getStudentsSupervised());
            profile.put("bio", user.getBio());
            profile.put("skills", user.getSkills());
            profile.put("location", user.getLocation());
            profile.put("joinDate", user.getCreatedAt());
            profile.put("lastActive", user.getLastActive());

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get professor profile: " + e.getMessage());
        }
    }

    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(@RequestHeader("Authorization") String token) {
        try {
            String userId = userService.getUserIdFromToken(token);
            return getProfessorProfile(userId);
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
            if (profileData.containsKey("researchInterests")) {
                user.setResearchInterests((java.util.List<String>) profileData.get("researchInterests"));
            }

            userRepository.save(user);
            
            return ResponseEntity.ok().body("Profile updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update profile: " + e.getMessage());
        }
    }

    @GetMapping("/teaching-stats/{userId}")
    public ResponseEntity<?> getTeachingStats(@PathVariable String userId) {
        try {
            // For now, return mock data
            Map<String, Object> stats = new HashMap<>();
            stats.put("coursesTeaching", 3);
            stats.put("studentsEnrolled", 150);
            stats.put("averageRating", 4.5);
            stats.put("totalClasses", 120);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get teaching stats: " + e.getMessage());
        }
    }

    @GetMapping("/my-teaching-stats")
    public ResponseEntity<?> getMyTeachingStats(@RequestHeader("Authorization") String token) {
        try {
            String userId = userService.getUserIdFromToken(token);
            return getTeachingStats(userId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get teaching stats: " + e.getMessage());
        }
    }
}
