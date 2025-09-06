package com.stjoseph.assessmentsystem.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.stjoseph.assessmentsystem.model.Alumni;
import com.stjoseph.assessmentsystem.model.Event;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.AlumniRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;

@Service
public class ManagementService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AlumniRepository alumniRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private ActivityService activityService;
    
    @Autowired
    private AlumniEventService alumniEventService;
    
    @Autowired
    private com.stjoseph.assessmentsystem.repository.AssessmentRepository assessmentRepository;
    
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Get real counts from database
            long totalStudents = userRepository.countByRole(User.UserRole.STUDENT);
            long totalProfessors = userRepository.countByRole(User.UserRole.PROFESSOR);
            
            // Count alumni from both User and Alumni repositories
            long totalAlumniFromUsers = userRepository.countByRole(User.UserRole.ALUMNI);
            long totalAlumniFromAlumni = alumniRepository.countByStatus(Alumni.AlumniStatus.APPROVED);
            long totalAlumni = totalAlumniFromUsers + totalAlumniFromAlumni;
            
            long pendingAlumni = alumniRepository.countByStatus(Alumni.AlumniStatus.PENDING);
            
            // Get total assessments count (you'll need to add this to your assessment repository)
            long totalAssessments;
            try {
                // Get real assessment count from database
                totalAssessments = assessmentRepository.count();
            } catch (Exception e) {
                System.err.println("Error counting assessments: " + e.getMessage());
                totalAssessments = 0;
            }
            
            stats.put("totalStudents", totalStudents);
            stats.put("totalProfessors", totalProfessors);
            stats.put("totalAlumni", totalAlumni);
            stats.put("pendingAlumni", pendingAlumni);
            stats.put("totalAssessments", totalAssessments);
            
            // Add static recent activities for demo purposes
            stats.put("recentActivities", getStaticRecentActivities());
            
            // Calculate system health based on various factors
            double healthScore = 100.0;
            
            // Reduce health if there are too many pending alumni
            if (pendingAlumni > 10) {
                healthScore -= (pendingAlumni - 10) * 0.5;
            }
            
            // Reduce health if no users exist
            if (totalStudents == 0 && totalProfessors == 0 && totalAlumni == 0) {
                healthScore = 50.0;
            }
            
            // Ensure health score is between 0 and 100
            healthScore = Math.max(0, Math.min(100, healthScore));
            stats.put("systemHealth", String.format("%.1f%%", healthScore));
            
            // Add timestamp for last update
            stats.put("lastUpdated", java.time.LocalDateTime.now().toString());
            
            System.out.println("Dashboard stats: " + stats);
        } catch (Exception e) {
            System.err.println("Error getting dashboard stats: " + e.getMessage());
            e.printStackTrace();
            // Return default values if there's an error
            stats.put("totalStudents", 0);
            stats.put("totalProfessors", 0);
            stats.put("totalAlumni", 0);
            stats.put("pendingAlumni", 0);
            stats.put("totalAssessments", 0);
            stats.put("recentActivities", getStaticRecentActivities());
            stats.put("systemHealth", "0%");
            stats.put("lastUpdated", java.time.LocalDateTime.now().toString());
        }
        
        return stats;
    }
    
    public Map<String, Object> getStudentHeatmap(String studentId) {
        try {
            System.out.println("ManagementService: Getting student heatmap for ID: " + studentId);
            
            // Get student activity data for heatmap
            Map<String, Object> heatmapData = activityService.getHeatmapData(studentId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("studentId", studentId);
            result.put("heatmapData", heatmapData);
            
            System.out.println("ManagementService: Successfully retrieved heatmap data");
            return result;
        } catch (Exception e) {
            System.err.println("ManagementService: Error getting student heatmap: " + e.getMessage());
            // Return empty heatmap data instead of throwing exception
            Map<String, Object> result = new HashMap<>();
            result.put("studentId", studentId);
            result.put("heatmapData", Map.of("heatmap", Map.of(), "dailyTotals", Map.of()));
            return result;
        }
    }
    
    public List<Alumni> getAlumniApplications() {
        return alumniRepository.findByStatus(Alumni.AlumniStatus.PENDING);
    }
    
    public List<Alumni> getApprovedAlumni() {
        return alumniRepository.findByStatus(Alumni.AlumniStatus.APPROVED);
    }
    
    public String updateAlumniStatus(String alumniId, boolean approved) {
        Optional<Alumni> alumniOpt = alumniRepository.findById(alumniId);
        if (alumniOpt.isPresent()) {
            Alumni alumni = alumniOpt.get();
            alumni.setStatus(approved ? Alumni.AlumniStatus.APPROVED : Alumni.AlumniStatus.REJECTED);
            alumni.setVerifiedAt(java.time.LocalDateTime.now());
            alumniRepository.save(alumni);
            
            // Log activity (removed for simplicity)
            String action = approved ? "approved" : "rejected";
            System.out.println("ManagementService: Alumni " + action + ": " + alumni.getName());
            
            // Send email notification
            try {
                if (approved) {
                    String temporaryPassword = generateRandomPassword();
                    // Set password directly in Alumni model
                    alumni.setPassword(passwordEncoder.encode(temporaryPassword));
                    alumni.setVerified(true);
                    alumni.setCreatedAt(java.time.LocalDateTime.now());
                    alumniRepository.save(alumni);
                    sendApprovalEmailWithCredentials(alumni, temporaryPassword);
                } else {
                    emailService.sendAlumniApprovalNotification(alumni.getEmail(), false);
                }
            } catch (Exception e) {
                System.out.println("Email notification failed: " + e.getMessage());
            }
            
            return approved ? "Alumni approved successfully" : "Alumni rejected successfully";
        }
        throw new RuntimeException("Alumni not found");
    }
    
    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }
    
    private void sendApprovalEmailWithCredentials(Alumni alumni, String password) {
        String subject = "Alumni Registration Approved - Login Credentials";
        String message = String.format(
            "Dear %s,\n\n" +
            "Congratulations! Your alumni registration has been approved by the management.\n\n" +
            "You can now log in to the St. Joseph Assessment System using the following credentials:\n\n" +
            "Email: %s\n" +
            "Temporary Password: %s\n\n" +
            "IMPORTANT: Please log in and change your password immediately for security reasons.\n\n" +
            "Login URL: [Your System URL]\n\n" +
            "Welcome to the alumni network!\n\n" +
            "Best regards,\n" +
            "St. Joseph Assessment System Management",
            alumni.getName(),
            alumni.getEmail(),
            password
        );
        
        emailService.sendSimpleMessage(alumni.getEmail(), subject, message);
    }
    
    public List<User> searchStudents(String email) {
        return userRepository.findByEmailContainingIgnoreCase(email)
                .stream()
                .filter(user -> user.getRole() == User.UserRole.STUDENT)
                .collect(Collectors.toList());
    }
    
    public String cleanupDuplicateUsers() {
        List<User> allUsers = userRepository.findAll();
        
        // Group users by email
        Map<String, List<User>> usersByEmail = allUsers.stream()
                .collect(Collectors.groupingBy(User::getEmail));
        
        int deletedCount = 0;
        for (Map.Entry<String, List<User>> entry : usersByEmail.entrySet()) {
            List<User> duplicates = entry.getValue();
            if (duplicates.size() > 1) {
                // Keep the first user, delete the rest
                for (int i = 1; i < duplicates.size(); i++) {
                    userRepository.delete(duplicates.get(i));
                    deletedCount++;
                }
            }
        }
        
        return "Deleted " + deletedCount + " duplicate users";
    }
    
    // Event Management methods
    public List<Object> getAllEventRequests() {
        return new ArrayList<>(); // Placeholder
    }
    
    public List<Event> getAllAlumniEventRequests() {
        return alumniEventService.getAllAlumniEventRequests();
    }
    
    public Object approveAlumniEventRequest(String requestId, String managementId) {
        return alumniEventService.approveAlumniEventRequest(requestId, managementId);
    }
    
    public Object rejectAlumniEventRequest(String requestId, String managementId, String reason) {
        return alumniEventService.rejectAlumniEventRequest(requestId, managementId, reason);
    }
    
    public List<Map<String, Object>> getAvailableAlumni() {
        try {
            // Get from both Alumni collection and User collection
            List<Alumni> verifiedAlumniFromAlumni = alumniRepository.findByStatus(Alumni.AlumniStatus.APPROVED);
            List<User> verifiedAlumniFromUsers = userRepository.findByRoleAndApproved(User.UserRole.ALUMNI, true);
            
            List<Map<String, Object>> result = new ArrayList<>();
            java.util.Set<String> addedEmails = new java.util.HashSet<>();
            
            // Add from Alumni collection
            verifiedAlumniFromAlumni.forEach(alumni -> {
                if (!addedEmails.contains(alumni.getEmail())) {
                    addedEmails.add(alumni.getEmail());
                    Map<String, Object> alumniData = new HashMap<>();
                    alumniData.put("id", alumni.getId());
                    alumniData.put("name", alumni.getName());
                    alumniData.put("email", alumni.getEmail());
                    alumniData.put("department", alumni.getDepartment());
                    alumniData.put("graduationYear", alumni.getGraduationYear());
                    alumniData.put("currentCompany", alumni.getPlacedCompany());
                    result.add(alumniData);
                }
            });
            
            // Add from User collection
            verifiedAlumniFromUsers.forEach(user -> {
                if (!addedEmails.contains(user.getEmail())) {
                    addedEmails.add(user.getEmail());
                    Map<String, Object> alumniData = new HashMap<>();
                    alumniData.put("id", user.getId());
                    alumniData.put("name", user.getName());
                    alumniData.put("email", user.getEmail());
                    alumniData.put("department", user.getDepartment());
                    alumniData.put("graduationYear", user.getGraduationYear() != null ? user.getGraduationYear().toString() : "Unknown");
                    alumniData.put("currentCompany", user.getCurrentCompany());
                    result.add(alumniData);
                }
            });
            
            System.out.println("ManagementService: Found " + result.size() + " available alumni");
            return result;
        } catch (Exception e) {
            System.err.println("Error getting available alumni: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    

    
    public Object requestEventFromAlumni(String managementId, String alumniId, Map<String, Object> requestData) {
        return alumniEventService.requestEventFromAlumni(managementId, alumniId, requestData);
    }
    
    public List<Event> getAllManagementEventRequests() {
        return alumniEventService.getAllManagementEventRequests();
    }
    
    private List<Map<String, Object>> getStaticRecentActivities() {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        try {
            // Get real recent activities from database
            List<User> recentUsers = userRepository.findAll().stream()
                .filter(user -> user.getLastLogin() != null)
                .sorted((a, b) -> b.getLastLogin().compareTo(a.getLastLogin()))
                .limit(10)
                .collect(Collectors.toList());
            
            for (User user : recentUsers) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", user.getId());
                activity.put("type", "USER_LOGIN");
                activity.put("description", user.getRole().toString().toLowerCase() + " logged in");
                activity.put("userName", user.getName());
                activity.put("timestamp", user.getLastLogin().toString());
                activities.add(activity);
            }
            
            // Add alumni verification activities
            List<Alumni> recentAlumni = alumniRepository.findByStatus(Alumni.AlumniStatus.APPROVED).stream()
                .filter(alumni -> alumni.getVerifiedAt() != null)
                .sorted((a, b) -> b.getVerifiedAt().compareTo(a.getVerifiedAt()))
                .limit(5)
                .collect(Collectors.toList());
            
            for (Alumni alumni : recentAlumni) {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", alumni.getId() + "_verification");
                activity.put("type", "ALUMNI_VERIFICATION");
                activity.put("description", "Alumni verification approved");
                activity.put("userName", alumni.getName());
                activity.put("timestamp", alumni.getVerifiedAt().toString());
                activities.add(activity);
            }
            
            // Sort all activities by timestamp
            activities.sort((a, b) -> {
                try {
                    java.time.LocalDateTime timeA = java.time.LocalDateTime.parse((String) a.get("timestamp"));
                    java.time.LocalDateTime timeB = java.time.LocalDateTime.parse((String) b.get("timestamp"));
                    return timeB.compareTo(timeA);
                } catch (Exception e) {
                    return 0;
                }
            });
            
            // Limit to 10 most recent activities
            if (activities.size() > 10) {
                activities = activities.subList(0, 10);
            }
            
        } catch (Exception e) {
            System.err.println("Error getting dynamic activities: " + e.getMessage());
            // Fallback to basic activity if database query fails
            Map<String, Object> fallbackActivity = new HashMap<>();
            fallbackActivity.put("id", "fallback");
            fallbackActivity.put("type", "SYSTEM");
            fallbackActivity.put("description", "System is running normally");
            fallbackActivity.put("userName", "System");
            fallbackActivity.put("timestamp", java.time.LocalDateTime.now().toString());
            activities.add(fallbackActivity);
        }
        
        return activities;
    }
    
    private String getActivityColor(String type) {
        switch (type.toLowerCase()) {
            case "user_login":
            case "login":
                return "bg-blue-500";
            case "alumni_verification":
                return "bg-green-500";
            case "assessment_created":
                return "bg-purple-500";
            case "system":
                return "bg-gray-500";
            default:
                return "bg-indigo-500";
        }
    }
    
    private String formatActivityTime(String timestamp) {
        try {
            java.time.LocalDateTime dateTime = java.time.LocalDateTime.parse(timestamp);
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            long minutes = java.time.Duration.between(dateTime, now).toMinutes();
            
            if (minutes < 1) return "Just now";
            if (minutes < 60) return minutes + " minutes ago";
            if (minutes < 1440) return (minutes / 60) + " hours ago";
            return (minutes / 1440) + " days ago";
        } catch (Exception e) {
            return "Unknown time";
        }
    }
}
