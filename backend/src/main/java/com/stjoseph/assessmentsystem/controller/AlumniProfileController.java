package com.stjoseph.assessmentsystem.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.model.AlumniProfile;
import com.stjoseph.assessmentsystem.service.AlumniProfileService;

@RestController
@RequestMapping("/alumni-profiles")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AlumniProfileController {
    
    @Autowired
    private AlumniProfileService alumniProfileService;
    
    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        try {
            String userId = getUserIdFromAuth(authentication);
            Map<String, Object> profile = alumniProfileService.getCompleteAlumniProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/my-profile")
    public ResponseEntity<?> updateMyProfile(@RequestBody AlumniProfile profileData, 
                                           Authentication authentication) {
        try {
            String userId = getUserIdFromAuth(authentication);
            AlumniProfile updatedProfile = alumniProfileService.updateProfile(userId, profileData);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/complete-profile/{userId}")
    public ResponseEntity<?> getCompleteProfile(@PathVariable String userId) {
        try {
            // Try to get profile by userId first, then by email if not found
            Map<String, Object> profile;
            try {
                profile = alumniProfileService.getCompleteAlumniProfileById(userId);
            } catch (Exception e) {
                // If not found by ID, try by email (for backward compatibility)
                profile = alumniProfileService.getCompleteAlumniProfile(userId);
            }
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    private String getUserIdFromAuth(Authentication authentication) {
        return ((com.stjoseph.assessmentsystem.security.UserDetailsImpl) authentication.getPrincipal()).getId();
    }
}
