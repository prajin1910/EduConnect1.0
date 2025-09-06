package com.stjoseph.assessmentsystem.controller;

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

import com.stjoseph.assessmentsystem.service.ManagementService;

@RestController
@RequestMapping("/management")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ManagementController {
    
    @Autowired
    private ManagementService managementService;
    
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> getDashboardStats() {
        try {
            var stats = managementService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/student/{studentId}/heatmap")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> getStudentHeatmap(@PathVariable String studentId) {
        try {
            System.out.println("ManagementController: Getting heatmap for student ID: " + studentId);
            var heatmap = managementService.getStudentHeatmap(studentId);
            System.out.println("ManagementController: Successfully retrieved heatmap data");
            return ResponseEntity.ok(heatmap);
        } catch (Exception e) {
            System.err.println("ManagementController: Error getting student heatmap: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/alumni")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> getAlumniApplications() {
        try {
            return ResponseEntity.ok(managementService.getAlumniApplications());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/alumni/{alumniId}/status")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> updateAlumniStatus(@PathVariable String alumniId, 
                                              @RequestBody Map<String, Boolean> request) {
        try {
            String result = managementService.updateAlumniStatus(alumniId, request.get("approved"));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/students/search")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> searchStudents(@RequestParam String email) {
        try {
            return ResponseEntity.ok(managementService.searchStudents(email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/cleanup-duplicates")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> cleanupDuplicateUsers() {
        try {
            String result = managementService.cleanupDuplicateUsers();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Event Management endpoints
    @GetMapping("/event-requests")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> getAllEventRequests() {
        try {
            return ResponseEntity.ok(managementService.getAllEventRequests());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/alumni-available")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> getAlumniForEventRequest() {
        try {
            return ResponseEntity.ok(managementService.getAvailableAlumni());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/request-alumni-event/{alumniId}")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> requestEventFromAlumni(@PathVariable String alumniId,
                                                   @RequestBody Map<String, Object> requestData,
                                                   Authentication authentication) {
        try {
            String managementId = getUserIdFromAuth(authentication);
            Object result = managementService.requestEventFromAlumni(managementId, alumniId, requestData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Get all management-to-alumni event requests
    @GetMapping("/management-event-requests")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> getAllManagementEventRequests() {
        try {
            return ResponseEntity.ok(managementService.getAllManagementEventRequests());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Alumni Event Request Management
    @GetMapping("/alumni-event-requests")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> getAllAlumniEventRequests() {
        try {
            return ResponseEntity.ok(managementService.getAllAlumniEventRequests());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/alumni-event-requests/{requestId}/approve")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> approveAlumniEventRequest(@PathVariable String requestId,
                                                      Authentication authentication) {
        try {
            String managementId = getUserIdFromAuth(authentication);
            Object result = managementService.approveAlumniEventRequest(requestId, managementId);
            
            // Notification is now handled inside the service method
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/alumni-event-requests/{requestId}/reject")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> rejectAlumniEventRequest(@PathVariable String requestId,
                                                     @RequestBody Map<String, String> request,
                                                     Authentication authentication) {
        try {
            String managementId = getUserIdFromAuth(authentication);
            String reason = request.get("reason");
            Object result = managementService.rejectAlumniEventRequest(requestId, managementId, reason);
            
            // Notification is now handled inside the service method
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    private String getUserIdFromAuth(Authentication authentication) {
        return ((com.stjoseph.assessmentsystem.security.UserDetailsImpl) authentication.getPrincipal()).getId();
    }
}