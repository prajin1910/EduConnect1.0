package com.stjoseph.assessmentsystem.controller;

import com.stjoseph.assessmentsystem.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/activities")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ActivityController {
    
    @Autowired
    private ActivityService activityService;
    
    @PostMapping
    public ResponseEntity<?> logActivity(@RequestBody Map<String, String> request, Authentication auth) {
        try {
            String type = request.get("type");
            String description = request.get("description");
            
            if (type == null || type.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Activity type is required");
            }
            if (description == null || description.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Activity description is required");
            }
            
            // Get user ID from authentication and log by ID instead of email
            String userId = getUserIdFromAuth(auth);
            activityService.logActivityByUserId(userId, type, description);
            return ResponseEntity.ok("Activity logged successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserActivities(@PathVariable String userId,
                                             @RequestParam(required = false) String startDate,
                                             @RequestParam(required = false) String endDate) {
        try {
            return ResponseEntity.ok(activityService.getUserActivities(userId, startDate, endDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/heatmap/{userId}")
    public ResponseEntity<?> getHeatmapData(@PathVariable String userId) {
        try {
            System.out.println("ActivityController: Getting heatmap data for user ID: " + userId);
            return ResponseEntity.ok(activityService.getHeatmapData(userId));
        } catch (Exception e) {
            System.err.println("ActivityController: Error getting heatmap data: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    private String getUserIdFromAuth(Authentication authentication) {
        return ((com.stjoseph.assessmentsystem.security.UserDetailsImpl) authentication.getPrincipal()).getId();
    }
}