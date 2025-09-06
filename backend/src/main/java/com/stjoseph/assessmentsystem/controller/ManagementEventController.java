package com.stjoseph.assessmentsystem.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.model.Event;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.EventRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;

@RestController
@RequestMapping("/api/management-events")
@CrossOrigin(origins = "http://localhost:3000")
public class ManagementEventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all pending event requests for management approval
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingEventRequests() {
        try {
            List<Event> pendingEvents = eventRepository.findByStatus(Event.EventStatus.PENDING);
            return ResponseEntity.ok(pendingEvents);
            
        } catch (Exception e) {
            System.err.println("Error getting pending events: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get pending events"));
        }
    }

    // Approve an event request
    @PutMapping("/{eventId}/approve")
    public ResponseEntity<?> approveEventRequest(@PathVariable String eventId, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (!eventOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Event not found"));
            }
            
            Event event = eventOpt.get();
            
            if (event.getStatus() != Event.EventStatus.PENDING) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Event is not pending approval"));
            }
            
            event.setStatus(Event.EventStatus.APPROVED);
            event.setApprovedBy(user.getId());
            event.setApprovedAt(LocalDateTime.now());
            
            Event savedEvent = eventRepository.save(event);
            
            return ResponseEntity.ok(Map.of(
                "message", "Event approved successfully",
                "event", savedEvent
            ));
            
        } catch (Exception e) {
            System.err.println("Error approving event: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to approve event"));
        }
    }

    // Reject an event request
    @PutMapping("/{eventId}/reject")
    public ResponseEntity<?> rejectEventRequest(@PathVariable String eventId, 
                                              @RequestBody Map<String, String> rejectionData,
                                              Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (!eventOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Event not found"));
            }
            
            Event event = eventOpt.get();
            
            if (event.getStatus() != Event.EventStatus.PENDING) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Event is not pending approval"));
            }
            
            event.setStatus(Event.EventStatus.REJECTED);
            event.setRejectedBy(user.getId());
            event.setRejectedAt(LocalDateTime.now());
            event.setRejectionReason(rejectionData.get("reason"));
            
            Event savedEvent = eventRepository.save(event);
            
            return ResponseEntity.ok(Map.of(
                "message", "Event rejected successfully",
                "event", savedEvent
            ));
            
        } catch (Exception e) {
            System.err.println("Error rejecting event: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reject event"));
        }
    }

    // Get all events (approved, pending, rejected)
    @GetMapping("/all")
    public ResponseEntity<?> getAllEvents() {
        try {
            List<Event> events = eventRepository.findAll();
            return ResponseEntity.ok(events);
            
        } catch (Exception e) {
            System.err.println("Error getting all events: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get events"));
        }
    }

    // Get approved events
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

    // Send event request to alumni (management initiated)
    @PostMapping("/send-to-alumni")
    public ResponseEntity<?> sendEventToAlumni(@RequestBody Map<String, Object> eventData, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Create new management-initiated event
            Event event = new Event();
            event.setTitle((String) eventData.get("title"));
            event.setDescription((String) eventData.get("description"));
            event.setLocation((String) eventData.get("location"));
            event.setDepartment((String) eventData.get("department"));
            event.setTargetAudience((String) eventData.get("targetAudience"));
            
            // Parse startDateTime and endDateTime from eventData
            if (eventData.get("startDateTime") != null) {
                event.setStartDateTime(LocalDateTime.parse((String) eventData.get("startDateTime")));
            }
            if (eventData.get("endDateTime") != null) {
                event.setEndDateTime(LocalDateTime.parse((String) eventData.get("endDateTime")));
            }
            
            if (eventData.get("maxAttendees") != null) {
                event.setMaxAttendees((Integer) eventData.get("maxAttendees"));
            }
            
            event.setContactEmail((String) eventData.get("contactEmail"));
            event.setContactPhone((String) eventData.get("contactPhone"));
            event.setSpecialRequirements((String) eventData.get("specialRequirements"));
            
            event.setOrganizerId(user.getId());
            event.setOrganizerName(user.getName());
            event.setOrganizerEmail(user.getEmail());
            event.setStatus(Event.EventStatus.APPROVED); // Management events are auto-approved
            event.setType(Event.EventType.MANAGEMENT_REQUESTED);
            event.setSubmittedAt(LocalDateTime.now());
            event.setApprovedAt(LocalDateTime.now());
            event.setApprovedBy(user.getId());
            
            Event savedEvent = eventRepository.save(event);
            
            return ResponseEntity.ok(Map.of(
                "message", "Event sent to alumni successfully",
                "eventId", savedEvent.getId()
            ));
            
        } catch (Exception e) {
            System.err.println("Error sending event to alumni: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send event to alumni: " + e.getMessage()));
        }
    }

    // Get event statistics
    @GetMapping("/stats")
    public ResponseEntity<?> getEventStatistics() {
        try {
            long totalEvents = eventRepository.count();
            long pendingEvents = eventRepository.countByStatus(Event.EventStatus.PENDING);
            long approvedEvents = eventRepository.countByStatus(Event.EventStatus.APPROVED);
            long rejectedEvents = eventRepository.countByStatus(Event.EventStatus.REJECTED);
            
            Map<String, Object> stats = Map.of(
                "total", totalEvents,
                "pending", pendingEvents,
                "approved", approvedEvents,
                "rejected", rejectedEvents
            );
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            System.err.println("Error getting event statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get statistics"));
        }
    }

    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok(Map.of(
            "message", "Management Event Controller is working",
            "timestamp", LocalDateTime.now().toString()
        ));
    }
}
