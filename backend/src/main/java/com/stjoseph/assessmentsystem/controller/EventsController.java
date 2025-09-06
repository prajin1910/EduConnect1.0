package com.stjoseph.assessmentsystem.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.model.Event;
import com.stjoseph.assessmentsystem.service.AlumniEventService;

@RestController
@RequestMapping("/api/events")
public class EventsController {
    
    private static final Logger logger = LoggerFactory.getLogger(EventsController.class);
    
    @Autowired
    private AlumniEventService alumniEventService;
    
    // Test endpoint to check authentication
    @GetMapping("/test")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_PROFESSOR', 'ROLE_ALUMNI', 'ROLE_MANAGEMENT')")
    public ResponseEntity<?> testAuth() {
        return ResponseEntity.ok("Authentication working!");
    }
    
    // Get all approved events - accessible by all authenticated users
    @GetMapping("/approved")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_PROFESSOR', 'ROLE_ALUMNI', 'ROLE_MANAGEMENT')")
    public ResponseEntity<List<Event>> getApprovedEvents() {
        logger.info("Fetching approved events for all users");
        try {
            List<Event> approvedEvents = alumniEventService.getApprovedEvents();
            logger.info("Found {} approved events", approvedEvents.size());
            return ResponseEntity.ok(approvedEvents);
        } catch (Exception e) {
            logger.error("Error fetching approved events: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new java.util.ArrayList<>());
        }
    }
    
    // Update attendance for an event
    @PostMapping("/{eventId}/attendance")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_PROFESSOR', 'ROLE_ALUMNI')")
    public ResponseEntity<?> updateAttendance(@PathVariable String eventId, @RequestBody Map<String, Object> requestData, Authentication authentication) {
        logger.info("Updating attendance for event: {} by user: {}", eventId, authentication.getName());
        try {
            boolean attending = (Boolean) requestData.get("attending");
            String userEmail = authentication.getName();
            
            Event updatedEvent = alumniEventService.updateAttendance(eventId, userEmail, attending);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", attending ? "Attendance confirmed" : "Attendance cancelled",
                "attendeeCount", updatedEvent.getAttendees() != null ? updatedEvent.getAttendees().size() : 0
            ));
        } catch (Exception e) {
            logger.error("Error updating attendance: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update attendance: " + e.getMessage()));
        }
    }
}
