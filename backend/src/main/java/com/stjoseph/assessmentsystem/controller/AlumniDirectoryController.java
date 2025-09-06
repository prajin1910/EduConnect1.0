package com.stjoseph.assessmentsystem.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.service.AlumniDirectoryService;

@RestController
@RequestMapping("/api/alumni-directory")
public class AlumniDirectoryController {
    
    @Autowired
    private AlumniDirectoryService alumniDirectoryService;
    
    // Test endpoint without role checking
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        try {
            // Test if service can retrieve alumni
            List<Map<String, Object>> alumni = alumniDirectoryService.getAllVerifiedAlumni();
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Alumni directory endpoint working!");
            response.put("alumniCount", alumni.size());
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error in alumni directory service");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", java.time.LocalDateTime.now().toString());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Get all verified alumni for directory (accessible by all users - no auth required)
    @GetMapping
    public ResponseEntity<?> getAllVerifiedAlumni() {
        try {
            List<Map<String, Object>> alumni = alumniDirectoryService.getAllVerifiedAlumni();
            System.out.println("AlumniDirectoryController: Returning " + alumni.size() + " alumni");
            return ResponseEntity.ok(alumni);
        } catch (Exception e) {
            System.err.println("AlumniDirectoryController error: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get all verified alumni for alumni users (excludes current user)
    @GetMapping("/for-alumni")
    @PreAuthorize("hasAuthority('ROLE_ALUMNI')")
    public ResponseEntity<?> getAllVerifiedAlumniForAlumni(Authentication authentication) {
        try {
            String currentUserId = getUserIdFromAuth(authentication);
            String currentUserEmail = getUserEmailFromAuth(authentication);
            List<Map<String, Object>> alumni = alumniDirectoryService.getAllVerifiedAlumniExcludingUser(currentUserId, currentUserEmail);
            System.out.println("AlumniDirectoryController: Returning " + alumni.size() + " alumni (excluding current user: " + currentUserEmail + ")");
            return ResponseEntity.ok(alumni);
        } catch (Exception e) {
            System.err.println("AlumniDirectoryController error: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get alumni profile by ID (accessible by all users - no auth required)
    @GetMapping("/{alumniId}")
    public ResponseEntity<?> getAlumniProfile(@PathVariable String alumniId) {
        try {
            Map<String, Object> profile = alumniDirectoryService.getAlumniProfile(alumniId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Search alumni (accessible by all users - no auth required)
    @GetMapping("/search")
    public ResponseEntity<?> searchAlumni(@RequestParam String query) {
        try {
            List<Map<String, Object>> alumni = alumniDirectoryService.searchAlumni(query);
            return ResponseEntity.ok(alumni);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get alumni statistics (for management and alumni)
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGEMENT', 'ROLE_ALUMNI')")
    public ResponseEntity<?> getAlumniStatistics() {
        try {
            Map<String, Object> stats = alumniDirectoryService.getAlumniStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Helper methods to get current user information
    private String getUserIdFromAuth(Authentication authentication) {
        return ((com.stjoseph.assessmentsystem.security.UserDetailsImpl) authentication.getPrincipal()).getId();
    }
    
    private String getUserEmailFromAuth(Authentication authentication) {
        return ((com.stjoseph.assessmentsystem.security.UserDetailsImpl) authentication.getPrincipal()).getEmail();
    }
}
