package com.stjoseph.assessmentsystem.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stjoseph.assessmentsystem.model.Alumni;
import com.stjoseph.assessmentsystem.repository.AlumniRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;

@Service
public class AlumniDirectoryService {
    
    @Autowired
    private AlumniRepository alumniRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Get all verified alumni for directory
    public List<Map<String, Object>> getAllVerifiedAlumni() {
        // Get from both Alumni collection and User collection with ALUMNI role
        List<Alumni> verifiedAlumniFromAlumni = alumniRepository.findByStatus(Alumni.AlumniStatus.APPROVED);
        List<com.stjoseph.assessmentsystem.model.User> verifiedAlumniFromUsers = userRepository.findByRoleAndApproved(com.stjoseph.assessmentsystem.model.User.UserRole.ALUMNI, true);
        
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        java.util.Set<String> addedEmails = new java.util.HashSet<>(); // Prevent duplicates
        
        // Add from Alumni collection
        verifiedAlumniFromAlumni.forEach(alumni -> {
            if (!addedEmails.contains(alumni.getEmail())) {
                addedEmails.add(alumni.getEmail());
                Map<String, Object> alumniInfo = new HashMap<>();
                alumniInfo.put("id", alumni.getId());
                alumniInfo.put("name", alumni.getName());
                alumniInfo.put("email", alumni.getEmail());
                alumniInfo.put("department", alumni.getDepartment());
                alumniInfo.put("graduationYear", alumni.getGraduationYear());
                alumniInfo.put("batch", alumni.getBatch());
                alumniInfo.put("placedCompany", alumni.getPlacedCompany());
                alumniInfo.put("phoneNumber", alumni.getPhoneNumber());
                alumniInfo.put("currentCompany", alumni.getPlacedCompany());
                alumniInfo.put("location", alumni.getDepartment() + " Department");
                alumniInfo.put("skills", new java.util.ArrayList<>());
                alumniInfo.put("isAvailableForMentorship", false);
                alumniInfo.put("mentorshipAvailable", false);
                alumniInfo.put("availableForMentorship", false);
                System.out.println("AlumniDirectoryService: Added alumni from Alumni table - ID: " + alumni.getId() + ", Name: " + alumni.getName());
                result.add(alumniInfo);
            }
        });
        
        // Add from User collection (for users with ALUMNI role)
        verifiedAlumniFromUsers.forEach(user -> {
            if (!addedEmails.contains(user.getEmail())) {
                addedEmails.add(user.getEmail());
                Map<String, Object> alumniInfo = new HashMap<>();
                alumniInfo.put("id", user.getId());
                alumniInfo.put("name", user.getName());
                alumniInfo.put("email", user.getEmail());
                alumniInfo.put("department", user.getDepartment());
                alumniInfo.put("graduationYear", user.getGraduationYear() != null ? user.getGraduationYear().toString() : "Unknown");
                alumniInfo.put("batch", user.getClassName());
                alumniInfo.put("placedCompany", user.getCurrentCompany());
                alumniInfo.put("phoneNumber", user.getPhoneNumber());
                alumniInfo.put("currentCompany", user.getCurrentCompany());
                alumniInfo.put("location", user.getLocation());
                alumniInfo.put("skills", user.getSkills() != null ? user.getSkills() : new java.util.ArrayList<>());
                alumniInfo.put("isAvailableForMentorship", Boolean.TRUE.equals(user.getMentorshipAvailable()));
                alumniInfo.put("mentorshipAvailable", Boolean.TRUE.equals(user.getMentorshipAvailable()));
                alumniInfo.put("availableForMentorship", Boolean.TRUE.equals(user.getMentorshipAvailable()));
                
                // Add connection count for alumni stats
                alumniInfo.put("connectionCount", user.getConnectionCount() != null ? user.getConnectionCount() : 0);
                
                System.out.println("AlumniDirectoryService: Added alumni from User table - ID: " + user.getId() + ", Name: " + user.getName());
                result.add(alumniInfo);
            }
        });
        
        System.out.println("AlumniDirectoryService: Found " + result.size() + " unique verified alumni");
        System.out.println("AlumniDirectoryService: Alumni IDs: " + result.stream().map(a -> a.get("id")).collect(java.util.stream.Collectors.toList()));
        
        return result;
    }
    
    // Get all verified alumni for directory excluding current user (for alumni portal)
    public List<Map<String, Object>> getAllVerifiedAlumniExcludingUser(String currentUserId, String currentUserEmail) {
        // Get from both Alumni collection and User collection with ALUMNI role
        List<Alumni> verifiedAlumniFromAlumni = alumniRepository.findByStatus(Alumni.AlumniStatus.APPROVED);
        List<com.stjoseph.assessmentsystem.model.User> verifiedAlumniFromUsers = userRepository.findByRoleAndApproved(com.stjoseph.assessmentsystem.model.User.UserRole.ALUMNI, true);
        
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        java.util.Set<String> addedEmails = new java.util.HashSet<>(); // Prevent duplicates
        
        // Add from Alumni collection, excluding current user
        verifiedAlumniFromAlumni.forEach(alumni -> {
            // Exclude current user by ID or email
            boolean isCurrentUser = (currentUserId != null && alumni.getId().equals(currentUserId)) || 
                                  (currentUserEmail != null && alumni.getEmail().equals(currentUserEmail));
            
            if (!isCurrentUser && !addedEmails.contains(alumni.getEmail())) {
                addedEmails.add(alumni.getEmail());
                Map<String, Object> alumniInfo = new HashMap<>();
                alumniInfo.put("id", alumni.getId());
                alumniInfo.put("name", alumni.getName());
                alumniInfo.put("email", alumni.getEmail());
                alumniInfo.put("department", alumni.getDepartment());
                alumniInfo.put("graduationYear", alumni.getGraduationYear());
                alumniInfo.put("batch", alumni.getBatch());
                alumniInfo.put("placedCompany", alumni.getPlacedCompany());
                alumniInfo.put("phoneNumber", alumni.getPhoneNumber());
                alumniInfo.put("currentCompany", alumni.getPlacedCompany());
                alumniInfo.put("location", alumni.getDepartment() + " Department");
                alumniInfo.put("skills", new java.util.ArrayList<>());
                alumniInfo.put("isAvailableForMentorship", false);
                alumniInfo.put("mentorshipAvailable", false);
                alumniInfo.put("availableForMentorship", false);
                result.add(alumniInfo);
            }
        });
        
        // Add from User collection (for users with ALUMNI role), excluding current user
        verifiedAlumniFromUsers.forEach(user -> {
            // Exclude current user by ID or email
            boolean isCurrentUser = (currentUserId != null && user.getId().equals(currentUserId)) || 
                                  (currentUserEmail != null && user.getEmail().equals(currentUserEmail));
            
            if (!isCurrentUser && !addedEmails.contains(user.getEmail())) {
                addedEmails.add(user.getEmail());
                Map<String, Object> alumniInfo = new HashMap<>();
                alumniInfo.put("id", user.getId());
                alumniInfo.put("name", user.getName());
                alumniInfo.put("email", user.getEmail());
                alumniInfo.put("department", user.getDepartment());
                alumniInfo.put("graduationYear", user.getGraduationYear() != null ? user.getGraduationYear().toString() : "Unknown");
                alumniInfo.put("batch", user.getClassName());
                alumniInfo.put("placedCompany", user.getCurrentCompany());
                alumniInfo.put("phoneNumber", user.getPhoneNumber());
                alumniInfo.put("currentCompany", user.getCurrentCompany());
                alumniInfo.put("location", user.getLocation());
                alumniInfo.put("skills", user.getSkills() != null ? user.getSkills() : new java.util.ArrayList<>());
                alumniInfo.put("isAvailableForMentorship", Boolean.TRUE.equals(user.getMentorshipAvailable()));
                alumniInfo.put("mentorshipAvailable", Boolean.TRUE.equals(user.getMentorshipAvailable()));
                alumniInfo.put("availableForMentorship", Boolean.TRUE.equals(user.getMentorshipAvailable()));
                
                // Add connection count for alumni stats
                alumniInfo.put("connectionCount", user.getConnectionCount() != null ? user.getConnectionCount() : 0);
                
                result.add(alumniInfo);
            }
        });
        
        System.out.println("AlumniDirectoryService: Found " + result.size() + " unique verified alumni (excluding current user)");
        
        return result;
    }
    
    // Get alumni profile by ID
    public Map<String, Object> getAlumniProfile(String alumniId) {
        Optional<Alumni> alumniOpt = alumniRepository.findById(alumniId);
        if (!alumniOpt.isPresent()) {
            throw new RuntimeException("Alumni not found");
        }
        
        Alumni alumni = alumniOpt.get();
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", alumni.getId());
        profile.put("name", alumni.getName());
        profile.put("email", alumni.getEmail());
        profile.put("phoneNumber", alumni.getPhoneNumber());
        profile.put("department", alumni.getDepartment());
        profile.put("graduationYear", alumni.getGraduationYear());
        profile.put("batch", alumni.getBatch());
        profile.put("placedCompany", alumni.getPlacedCompany());
        profile.put("status", alumni.getStatus().toString());
        profile.put("verifiedAt", alumni.getVerifiedAt());
        
        return profile;
    }
    
    // Search alumni by various criteria
    public List<Map<String, Object>> searchAlumni(String query) {
        List<Alumni> allAlumni = alumniRepository.findByStatus(Alumni.AlumniStatus.APPROVED);
        
        // Simple search implementation
        List<Alumni> filteredAlumni = allAlumni.stream()
            .filter(alumni -> 
                alumni.getName().toLowerCase().contains(query.toLowerCase()) ||
                alumni.getDepartment().toLowerCase().contains(query.toLowerCase()) ||
                alumni.getPlacedCompany().toLowerCase().contains(query.toLowerCase()) ||
                alumni.getBatch().toLowerCase().contains(query.toLowerCase())
            )
            .collect(Collectors.toList());
        
        return filteredAlumni.stream().map(alumni -> {
            Map<String, Object> alumniInfo = new HashMap<>();
            alumniInfo.put("id", alumni.getId());
            alumniInfo.put("name", alumni.getName());
            alumniInfo.put("email", alumni.getEmail());
            alumniInfo.put("department", alumni.getDepartment());
            alumniInfo.put("graduationYear", alumni.getGraduationYear());
            alumniInfo.put("batch", alumni.getBatch());
            alumniInfo.put("placedCompany", alumni.getPlacedCompany());
            return alumniInfo;
        }).collect(Collectors.toList());
    }
    
    // Get alumni statistics
    public Map<String, Object> getAlumniStatistics() {
        List<Alumni> verifiedAlumni = alumniRepository.findByStatus(Alumni.AlumniStatus.APPROVED);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAlumni", verifiedAlumni.size());
        
        // Group by department
        Map<String, Long> departmentStats = verifiedAlumni.stream()
            .collect(Collectors.groupingBy(Alumni::getDepartment, Collectors.counting()));
        stats.put("departmentWise", departmentStats);
        
        // Group by graduation year
        Map<String, Long> yearStats = verifiedAlumni.stream()
            .collect(Collectors.groupingBy(Alumni::getGraduationYear, Collectors.counting()));
        stats.put("yearWise", yearStats);
        
        // Group by company
        Map<String, Long> companyStats = verifiedAlumni.stream()
            .collect(Collectors.groupingBy(Alumni::getPlacedCompany, Collectors.counting()));
        stats.put("companyWise", companyStats);
        
        return stats;
    }
}