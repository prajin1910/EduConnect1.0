package com.stjoseph.assessmentsystem.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.model.Alumni;
import com.stjoseph.assessmentsystem.model.Event;
import com.stjoseph.assessmentsystem.repository.AlumniRepository;
import com.stjoseph.assessmentsystem.repository.EventRepository;
import com.stjoseph.assessmentsystem.service.AlumniEventService;

@RestController
@RequestMapping("/api/alumni-events")
@CrossOrigin(origins = "http://localhost:3000")
public class AlumniEventController {

    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private AlumniRepository alumniRepository;
    
    @Autowired
    private AlumniEventService alumniEventService;

    // Submit a new event request
    @PostMapping("/request")
    @PreAuthorize("hasAuthority('ROLE_ALUMNI')")
    public ResponseEntity<?> submitEventRequest(@RequestBody Map<String, Object> eventData, Authentication authentication) {
        try {
            System.out.println("Received event request: " + eventData.get("title"));
            
            // Get current alumni user - alumni data is only in Alumni table
            String userEmail = authentication.getName();
            Alumni alumni = alumniRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Alumni not found"));
            
            // Verify alumni is approved
            if (alumni.getStatus() != Alumni.AlumniStatus.APPROVED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Only approved alumni can submit event requests"));
            }
            
            // Create new event
            Event event = new Event();
            event.setTitle((String) eventData.get("title"));
            event.setDescription((String) eventData.get("description"));
            event.setLocation((String) eventData.get("location"));
            event.setDepartment((String) eventData.get("department"));
            event.setTargetAudience((String) eventData.getOrDefault("targetAudience", "All Students"));
            
            // Parse startDateTime and endDateTime from eventData
            if (eventData.get("startDateTime") != null) {
                event.setStartDateTime(LocalDateTime.parse((String) eventData.get("startDateTime")));
            }
            if (eventData.get("endDateTime") != null) {
                event.setEndDateTime(LocalDateTime.parse((String) eventData.get("endDateTime")));
            }
            
            if (eventData.get("maxAttendees") != null) {
                Object maxAttendeesObj = eventData.get("maxAttendees");
                if (maxAttendeesObj instanceof Integer) {
                    event.setMaxAttendees((Integer) maxAttendeesObj);
                } else if (maxAttendeesObj instanceof String) {
                    try {
                        event.setMaxAttendees(Integer.parseInt((String) maxAttendeesObj));
                    } catch (NumberFormatException e) {
                        event.setMaxAttendees(50); // Default value
                    }
                } else {
                    event.setMaxAttendees(50); // Default value
                }
            } else {
                event.setMaxAttendees(50); // Default value
            }
            
            event.setContactEmail(alumni.getEmail());
            event.setContactPhone(alumni.getPhoneNumber());
            event.setSpecialRequirements((String) eventData.get("specialRequirements"));
            
            event.setOrganizerId(alumni.getId());
            event.setOrganizerName(alumni.getName());
            event.setOrganizerEmail(alumni.getEmail());
            event.setStatus(Event.EventStatus.PENDING);
            event.setType(Event.EventType.ALUMNI_INITIATED);
            event.setSubmittedAt(LocalDateTime.now());
            
            Event savedEvent = eventRepository.save(event);
            
            System.out.println("Event request saved successfully with ID: " + savedEvent.getId());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Event request submitted successfully",
                "eventId", savedEvent.getId()
            ));
            
        } catch (Exception e) {
            System.err.println("Error submitting event request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to submit event request: " + e.getMessage()));
        }
    }

    // Get pending event requests for current alumni
    @GetMapping("/my-requests")
    @PreAuthorize("hasAuthority('ROLE_ALUMNI')")
    public ResponseEntity<?> getMyEventRequests(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Alumni alumni = alumniRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Alumni not found"));
            
            List<Event> events = eventRepository.findByOrganizerId(alumni.getId());
            return ResponseEntity.ok(events);
            
        } catch (Exception e) {
            System.err.println("Error getting alumni event requests: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get event requests"));
        }
    }

    // Get all approved events
    @GetMapping("/approved")
    public ResponseEntity<?> getApprovedEvents() {
        try {
            List<Event> events = eventRepository.findByStatus(Event.EventStatus.APPROVED);
            return ResponseEntity.ok(events);
            
        } catch (Exception e) {
            System.err.println("Error getting approved events: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get approved events"));
        }
    }

    // Get event by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable String id) {
        try {
            Optional<Event> event = eventRepository.findById(id);
            if (event.isPresent()) {
                return ResponseEntity.ok(event.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Event not found"));
            }
        } catch (Exception e) {
            System.err.println("Error getting event: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get event"));
        }
    }

    // Cancel event request
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelEventRequest(@PathVariable String id, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Alumni alumni = alumniRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Alumni not found"));
            
            Optional<Event> eventOpt = eventRepository.findById(id);
            if (!eventOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Event not found"));
            }
            
            Event event = eventOpt.get();
            
            // Check if alumni owns this event
            if (!event.getOrganizerId().equals(alumni.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Not authorized to cancel this event"));
            }
            
            // Only allow cancellation if pending
            if (event.getStatus() != Event.EventStatus.PENDING) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Can only cancel pending events"));
            }
            
            event.setStatus(Event.EventStatus.CANCELLED);
            eventRepository.save(event);
            
            return ResponseEntity.ok(Map.of("message", "Event request cancelled successfully"));
            
        } catch (Exception e) {
            System.err.println("Error cancelling event: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to cancel event"));
        }
    }

    // Test endpoint to verify controller is working
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok(Map.of(
            "message", "Alumni Event Controller is working",
            "timestamp", LocalDateTime.now().toString()
        ));
    }
    
    // Manual endpoint to mark completed events (for testing)
    @PostMapping("/mark-completed")
    public ResponseEntity<?> markCompletedEvents() {
        try {
            Object result = alumniEventService.markCompletedEvents();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error marking completed events: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to mark completed events: " + e.getMessage()));
        }
    }
}
