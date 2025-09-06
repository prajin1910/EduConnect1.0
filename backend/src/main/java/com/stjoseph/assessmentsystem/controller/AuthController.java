package com.stjoseph.assessmentsystem.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.dto.LoginRequest;
import com.stjoseph.assessmentsystem.dto.LoginResponse;
import com.stjoseph.assessmentsystem.dto.OTPVerificationRequest;
import com.stjoseph.assessmentsystem.dto.RegisterRequest;
import com.stjoseph.assessmentsystem.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    @Autowired
    AuthService authService;
    
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        try {
            // Custom validation for alumni registration (no password required)
            if ("alumni".equalsIgnoreCase(signUpRequest.getRole())) {
                if (signUpRequest.getName() == null || signUpRequest.getName().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Name is required");
                }
                if (signUpRequest.getEmail() == null || signUpRequest.getEmail().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Email is required");
                }
                if (signUpRequest.getPhoneNumber() == null || signUpRequest.getPhoneNumber().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Phone number is required");
                }
                if (signUpRequest.getDepartment() == null || signUpRequest.getDepartment().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Department is required");
                }
                
                String message = authService.registerAlumni(signUpRequest);
                return ResponseEntity.ok(message);
            } else {
                // For regular users, use @Valid annotation for validation
                if (signUpRequest.getName() == null || signUpRequest.getName().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Name is required");
                }
                if (signUpRequest.getEmail() == null || signUpRequest.getEmail().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Email is required");
                }
                if (signUpRequest.getPassword() == null || signUpRequest.getPassword().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Password is required");
                }
                if (signUpRequest.getPhoneNumber() == null || signUpRequest.getPhoneNumber().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Phone number is required");
                }
                if (signUpRequest.getDepartment() == null || signUpRequest.getDepartment().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Department is required");
                }
                if (signUpRequest.getRole() == null || signUpRequest.getRole().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body("Role is required");
                }
                
                String message = authService.registerUser(signUpRequest);
                return ResponseEntity.ok(message);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@Valid @RequestBody OTPVerificationRequest request) {
        try {
            String message = authService.verifyOTP(request);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOTP(@RequestParam String email) {
        try {
            String message = authService.resendOTP(email);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Temporary endpoint to clean up duplicate users - remove after fixing the issue
    @PostMapping("/cleanup-duplicates")
    public ResponseEntity<?> cleanupDuplicateUsers() {
        try {
            String message = authService.cleanupDuplicateUsers();
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            if (currentPassword == null || currentPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Current password is required");
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("New password is required");
            }
            
            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body("New password must be at least 6 characters long");
            }
            
            String userEmail = authentication.getName();
            String message = authService.changePassword(userEmail, currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}