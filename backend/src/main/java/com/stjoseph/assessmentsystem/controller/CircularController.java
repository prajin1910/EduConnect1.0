package com.stjoseph.assessmentsystem.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.dto.CircularRequest;
import com.stjoseph.assessmentsystem.model.Circular;
import com.stjoseph.assessmentsystem.service.CircularService;

@RestController
@RequestMapping("/circulars")
@CrossOrigin(origins = "*")
public class CircularController {

    @Autowired
    private CircularService circularService;

    // Create and send a circular
    @PostMapping
    public ResponseEntity<?> createCircular(@RequestBody CircularRequest request, Authentication authentication) {
        try {
            System.out.println("=== CircularController.createCircular called ===");
            String userId = authentication.getName();
            System.out.println("User ID: " + userId);
            System.out.println("Authorities: " + authentication.getAuthorities());
            
            // Validate request
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
            }
            if (request.getBody() == null || request.getBody().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Body is required"));
            }
            if (request.getRecipientTypes() == null || request.getRecipientTypes().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "At least one recipient type must be selected"));
            }
            
            Circular circular = circularService.createCircular(request, userId);
            return ResponseEntity.ok(circular);
        } catch (Exception e) {
            System.err.println("Error creating circular: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // Get circulars for the current user (what they can see)
    @GetMapping("/my-received")
    public ResponseEntity<?> getMyReceivedCirculars(Authentication authentication) {
        try {
            String userId = authentication.getName();
            List<Circular> circulars = circularService.getCircularsForUser(userId);
            return ResponseEntity.ok(circulars);
        } catch (Exception e) {
            System.err.println("Error fetching received circulars: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch circulars"));
        }
    }

    // Get circulars sent by the current user
    @GetMapping("/my-sent")
    public ResponseEntity<?> getMySentCirculars(Authentication authentication) {
        try {
            System.out.println("=== CircularController.getMySentCirculars called ===");
            String userId = authentication.getName();
            System.out.println("User ID: " + userId);
            List<Circular> circulars = circularService.getCircularsSentByUser(userId);
            return ResponseEntity.ok(circulars);
        } catch (Exception e) {
            System.err.println("Error fetching sent circulars: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch sent circulars"));
        }
    }

    // Get a specific circular by ID
    @GetMapping("/{circularId}")
    public ResponseEntity<?> getCircular(@PathVariable String circularId, Authentication authentication) {
        try {
            String userId = authentication.getName();
            Circular circular = circularService.getCircularById(circularId, userId);
            return ResponseEntity.ok(circular);
        } catch (Exception e) {
            System.err.println("Error fetching circular: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // Mark a circular as read
    @PostMapping("/{circularId}/read")
    public ResponseEntity<?> markCircularAsRead(@PathVariable String circularId, Authentication authentication) {
        try {
            String userId = authentication.getName();
            circularService.markCircularAsRead(circularId, userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Circular marked as read"));
        } catch (Exception e) {
            System.err.println("Error marking circular as read: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to mark circular as read"));
        }
    }

    // Archive a circular (only sender can do this)
    @PostMapping("/{circularId}/archive")
    public ResponseEntity<?> archiveCircular(@PathVariable String circularId, Authentication authentication) {
        try {
            String userId = authentication.getName();
            circularService.archiveCircular(circularId, userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Circular archived successfully"));
        } catch (Exception e) {
            System.err.println("Error archiving circular: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", e.getMessage()));
        }
    }

    // Get unread circular count
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCircularCount(Authentication authentication) {
        try {
            String userId = authentication.getName();
            long count = circularService.getUnreadCircularCount(userId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            System.err.println("Error fetching unread circular count: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch unread count"));
        }
    }

    // Get circular statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getCircularStats(Authentication authentication) {
        try {
            String userId = authentication.getName();
            Map<String, Object> stats = circularService.getCircularStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error fetching circular stats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch statistics"));
        }
    }

    // Get all circulars (for management dashboard - optional)
    @GetMapping("/all")
    public ResponseEntity<?> getAllCirculars(Authentication authentication) {
        try {
            // This endpoint could be restricted to management only
            List<Circular> circulars = circularService.getAllCirculars();
            return ResponseEntity.ok(circulars);
        } catch (Exception e) {
            System.err.println("Error fetching all circulars: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch circulars"));
        }
    }
}
