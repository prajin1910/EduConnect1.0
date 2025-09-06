package com.stjoseph.assessmentsystem.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.UserRepository;

@RestController
@RequestMapping("/api/alumni-network")
@CrossOrigin(origins = "http://localhost:3000")
public class AlumniNetworkController {

    @Autowired
    private UserRepository userRepository;

    // Get all verified alumni
    @GetMapping
    public ResponseEntity<?> getAllVerifiedAlumni() {
        try {
            List<User> alumni = userRepository.findByRoleAndApproved(User.UserRole.ALUMNI, true);
            
            // Transform to public profile format
            List<Map<String, Object>> alumniProfiles = alumni.stream()
                .map(this::convertToPublicProfile)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(alumniProfiles);
            
        } catch (Exception e) {
            System.err.println("Error getting alumni directory: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get alumni directory"));
        }
    }

    // Get alumni profile by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getAlumniProfile(@PathVariable String id) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Alumni not found"));
            }
            
            User user = userOpt.get();
            
            // Check if user is alumni and verified
            if (user.getRole() != User.UserRole.ALUMNI || !user.isVerified()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Alumni not found"));
            }
            
            Map<String, Object> profile = convertToPublicProfile(user);
            return ResponseEntity.ok(profile);
            
        } catch (Exception e) {
            System.err.println("Error getting alumni profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get alumni profile"));
        }
    }

    // Search alumni by name, department, or company
    @GetMapping("/search")
    public ResponseEntity<?> searchAlumni(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String company) {
        try {
            List<User> alumni = userRepository.findByRoleAndApproved(User.UserRole.ALUMNI, true);
            
            // Filter based on search criteria
            List<User> filteredAlumni = alumni.stream()
                .filter(user -> {
                    boolean matches = true;
                    
                    if (name != null && !name.trim().isEmpty()) {
                        matches = matches && user.getName().toLowerCase().contains(name.toLowerCase());
                    }
                    
                    if (department != null && !department.trim().isEmpty()) {
                        matches = matches && user.getDepartment() != null && 
                                 user.getDepartment().toLowerCase().contains(department.toLowerCase());
                    }
                    
                    if (company != null && !company.trim().isEmpty()) {
                        matches = matches && user.getCurrentCompany() != null && 
                                 user.getCurrentCompany().toLowerCase().contains(company.toLowerCase());
                    }
                    
                    return matches;
                })
                .collect(Collectors.toList());
            
            // Transform to public profile format
            List<Map<String, Object>> profiles = filteredAlumni.stream()
                .map(this::convertToPublicProfile)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(profiles);
            
        } catch (Exception e) {
            System.err.println("Error searching alumni: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search alumni"));
        }
    }

    // Get alumni statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getAlumniStatistics() {
        try {
            long totalAlumni = userRepository.countByRole(User.UserRole.ALUMNI);
            long verifiedAlumni = userRepository.findByRoleAndApproved(User.UserRole.ALUMNI, true).size();
            
            List<User> alumni = userRepository.findByRoleAndApproved(User.UserRole.ALUMNI, true);
            
            // Count by department
            Map<String, Long> departmentStats = alumni.stream()
                .filter(user -> user.getDepartment() != null && !user.getDepartment().trim().isEmpty())
                .collect(Collectors.groupingBy(User::getDepartment, Collectors.counting()));
            
            // Count by graduation year
            Map<String, Long> yearStats = alumni.stream()
                .filter(user -> user.getGraduationYear() != null)
                .collect(Collectors.groupingBy(
                    user -> String.valueOf(user.getGraduationYear()), 
                    Collectors.counting()));
            
            // Count placed alumni
            long placedAlumni = alumni.stream()
                .filter(user -> user.getCurrentCompany() != null && !user.getCurrentCompany().trim().isEmpty())
                .count();
            
            Map<String, Object> stats = Map.of(
                "totalAlumni", totalAlumni,
                "verifiedAlumni", verifiedAlumni,
                "placedAlumni", placedAlumni,
                "departmentStats", departmentStats,
                "yearStats", yearStats
            );
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            System.err.println("Error getting alumni statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get alumni statistics"));
        }
    }

    // Get alumni by department
    @GetMapping("/department/{department}")
    public ResponseEntity<?> getAlumniByDepartment(@PathVariable String department) {
        try {
            List<User> alumni = userRepository.findByRoleAndApproved(User.UserRole.ALUMNI, true);
            
            List<User> filteredAlumni = alumni.stream()
                .filter(user -> user.getDepartment() != null && 
                               user.getDepartment().equalsIgnoreCase(department))
                .collect(Collectors.toList());
            
            List<Map<String, Object>> profiles = filteredAlumni.stream()
                .map(this::convertToPublicProfile)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(profiles);
            
        } catch (Exception e) {
            System.err.println("Error getting alumni by department: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get alumni by department"));
        }
    }

    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        try {
            long alumniCount = userRepository.countByRole(User.UserRole.ALUMNI);
            return ResponseEntity.ok(Map.of(
                "message", "Alumni Network Controller is working",
                "totalAlumni", alumniCount
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "message", "Alumni Network Controller is working",
                "error", e.getMessage()
            ));
        }
    }

    private Map<String, Object> convertToPublicProfile(User user) {
        return Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "department", user.getDepartment() != null ? user.getDepartment() : "",
            "phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
            "graduationYear", user.getGraduationYear() != null ? String.valueOf(user.getGraduationYear()) : "",
            "batch", user.getClassName() != null ? user.getClassName() : "",
            "placedCompany", user.getCurrentCompany() != null ? user.getCurrentCompany() : ""
        );
    }
}
