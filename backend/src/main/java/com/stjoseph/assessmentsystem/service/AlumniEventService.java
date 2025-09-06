package com.stjoseph.assessmentsystem.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stjoseph.assessmentsystem.model.Alumni;
import com.stjoseph.assessmentsystem.model.Event;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.AlumniRepository;
import com.stjoseph.assessmentsystem.repository.EventRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;

@Service
public class AlumniEventService {
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AlumniRepository alumniRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    // Alumni submits event request
    public Object submitEventRequest(String alumniEmail, Map<String, Object> requestData) {
        try {
            System.out.println("AlumniEventService: Processing event request from " + alumniEmail);
            
            // Find alumni user
            User alumni = userRepository.findByEmail(alumniEmail)
                    .orElseThrow(() -> new RuntimeException("Alumni not found"));
            
            // Create new event
            Event event = new Event();
            event.setTitle((String) requestData.get("title"));
            event.setDescription((String) requestData.get("description"));
            event.setLocation((String) requestData.get("venue"));
            event.setDepartment(alumni.getDepartment());
            event.setTargetAudience((String) requestData.get("targetAudience"));
            
            // Parse date/time fields with multiple possible field names
            String startDateTimeStr = (String) requestData.get("startDateTime");
            if (startDateTimeStr == null) {
                startDateTimeStr = (String) requestData.get("eventDateTime");
            }
            
            String endDateTimeStr = (String) requestData.get("endDateTime");
            if (endDateTimeStr == null) {
                endDateTimeStr = (String) requestData.get("eventEndDateTime");
            }
            
            // Handle date/time parsing
            if (startDateTimeStr != null && !startDateTimeStr.isEmpty()) {
                LocalDateTime startDateTime = LocalDateTime.parse(startDateTimeStr);
                event.setStartDateTime(startDateTime);
                
                if (endDateTimeStr != null && !endDateTimeStr.isEmpty()) {
                    LocalDateTime endDateTime = LocalDateTime.parse(endDateTimeStr);
                    event.setEndDateTime(endDateTime);
                } else {
                    // Default end time is 2 hours after start
                    event.setEndDateTime(startDateTime.plusHours(2));
                }
            } else {
                // Set default date/time if none provided
                LocalDateTime defaultStart = LocalDateTime.now().plusDays(7); // Default to 1 week from now
                event.setStartDateTime(defaultStart);
                event.setEndDateTime(defaultStart.plusHours(2));
            }
            
            // Handle attendees with multiple possible field names
            Object attendeesObj = requestData.get("expectedAttendees");
            if (attendeesObj == null) {
                attendeesObj = requestData.get("maxAttendees");
            }
            
            if (attendeesObj != null) {
                String attendeesStr = attendeesObj.toString();
                try {
                    event.setMaxAttendees(Integer.valueOf(attendeesStr));
                } catch (NumberFormatException e) {
                    event.setMaxAttendees(50); // Default value
                }
            } else {
                event.setMaxAttendees(50); // Default value
            }
            
            // Set target audience if not provided
            if (event.getTargetAudience() == null || event.getTargetAudience().isEmpty()) {
                event.setTargetAudience("All Students");
            }
            
            event.setContactEmail(alumni.getEmail());
            event.setContactPhone(alumni.getPhoneNumber());
            event.setSpecialRequirements((String) requestData.get("specialRequirements"));
            
            event.setOrganizerId(alumni.getId());
            event.setOrganizerName(alumni.getName());
            event.setOrganizerEmail(alumni.getEmail());
            event.setStatus(Event.EventStatus.PENDING);
            event.setType(Event.EventType.ALUMNI_INITIATED);
            event.setSubmittedAt(LocalDateTime.now());
            
            Event savedEvent = eventRepository.save(event);
            
            // Send notification to management
            notificationService.sendNewEventRequestNotification(event.getTitle());
            
            System.out.println("AlumniEventService: Event request saved with ID: " + savedEvent.getId());
            
            return Map.of(
                "success", true,
                "message", "Event request submitted successfully",
                "eventId", savedEvent.getId()
            );
            
        } catch (Exception e) {
            System.err.println("AlumniEventService error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to submit event request: " + e.getMessage());
        }
    }
    
    // Get all approved events (for all users) - only returns currently active approved events
    public List<Event> getApprovedEvents() {
        try {
            List<Event> events = eventRepository.findByStatus(Event.EventStatus.APPROVED);
            System.out.println("AlumniEventService: Found " + events.size() + " approved events");
            return events;
        } catch (Exception e) {
            System.err.println("AlumniEventService: Error getting approved events: " + e.getMessage());
            throw new RuntimeException("Failed to get approved events: " + e.getMessage());
        }
    }
    
    // Management approves alumni event request
    public Object approveAlumniEventRequest(String requestId, String managementId) {
        try {
            Optional<Event> eventOpt = eventRepository.findById(requestId);
            if (!eventOpt.isPresent()) {
                throw new RuntimeException("Event request not found");
            }
            
            Event event = eventOpt.get();
            
            if (event.getStatus() != Event.EventStatus.PENDING) {
                throw new RuntimeException("Event is not pending approval");
            }
            
            // Update event status
            event.setStatus(Event.EventStatus.APPROVED);
            event.setApprovedBy(managementId);
            event.setApprovedAt(LocalDateTime.now());
            
            Event savedEvent = eventRepository.save(event);
            
            // Update alumni events count when their event gets approved
            try {
                User alumni = userRepository.findByEmail(event.getOrganizerEmail()).orElse(null);
                if (alumni != null) {
                    // For alumni stats, we'll count approved events they organized
                    System.out.println("Alumni " + alumni.getName() + " had their event approved: " + event.getTitle());
                } else {
                    // Try to find in Alumni table and update corresponding User record
                    Optional<Alumni> alumniOpt = alumniRepository.findByEmail(event.getOrganizerEmail());
                    if (alumniOpt.isPresent()) {
                        Alumni alumniProfile = alumniOpt.get();
                        Optional<User> userByEmail = userRepository.findByEmail(alumniProfile.getEmail());
                        if (userByEmail.isPresent()) {
                            User user = userByEmail.get();
                            System.out.println("Alumni " + user.getName() + " (via email lookup) had their event approved: " + event.getTitle());
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Error updating alumni events count: " + e.getMessage());
            }
            
            // Send approval notification to alumni
            notificationService.sendEventApprovalNotification(
                event.getOrganizerEmail(), 
                event.getTitle(), 
                true, 
                null
            );
            
            System.out.println("AlumniEventService: Event approved: " + event.getTitle());
            
            return Map.of(
                "success", true,
                "message", "Event approved successfully",
                "event", savedEvent
            );
            
        } catch (Exception e) {
            System.err.println("AlumniEventService: Error approving event: " + e.getMessage());
            throw new RuntimeException("Failed to approve event: " + e.getMessage());
        }
    }
    
    // Management rejects alumni event request
    public Object rejectAlumniEventRequest(String requestId, String managementId, String reason) {
        try {
            Optional<Event> eventOpt = eventRepository.findById(requestId);
            if (!eventOpt.isPresent()) {
                throw new RuntimeException("Event request not found");
            }
            
            Event event = eventOpt.get();
            
            if (event.getStatus() != Event.EventStatus.PENDING) {
                throw new RuntimeException("Event is not pending approval");
            }
            
            // Update event status
            event.setStatus(Event.EventStatus.REJECTED);
            event.setRejectedBy(managementId);
            event.setRejectedAt(LocalDateTime.now());
            event.setRejectionReason(reason);
            
            Event savedEvent = eventRepository.save(event);
            
            // Send rejection notification to alumni
            notificationService.sendEventApprovalNotification(
                event.getOrganizerEmail(), 
                event.getTitle(), 
                false, 
                reason
            );
            
            System.out.println("AlumniEventService: Event rejected: " + event.getTitle());
            
            return Map.of(
                "success", true,
                "message", "Event rejected successfully",
                "event", savedEvent
            );
            
        } catch (Exception e) {
            System.err.println("AlumniEventService: Error rejecting event: " + e.getMessage());
            throw new RuntimeException("Failed to reject event: " + e.getMessage());
        }
    }
    
    // Get all alumni event requests (for management)
    public List<Event> getAllAlumniEventRequests() {
        try {
            List<Event> events = eventRepository.findByType(Event.EventType.ALUMNI_INITIATED);
            System.out.println("AlumniEventService: Found " + events.size() + " alumni event requests");
            return events;
        } catch (Exception e) {
            System.err.println("AlumniEventService: Error getting alumni requests: " + e.getMessage());
            throw new RuntimeException("Failed to get alumni event requests: " + e.getMessage());
        }
    }
    
    // Management requests event from alumni
    public Object requestEventFromAlumni(String managementId, String alumniId, Map<String, Object> requestData) {
        try {
            System.out.println("AlumniEventService: Management requesting event from alumni");
            System.out.println("Alumni ID received: " + alumniId);
            System.out.println("Management ID: " + managementId);
            
            // Find management user
            User management = userRepository.findById(managementId)
                    .orElseThrow(() -> new RuntimeException("Management user not found"));
            
            // Find alumni - check both User and Alumni repositories
            User alumniUser = null;
            Alumni alumniProfile = null;
            
            // First try Alumni repository
            System.out.println("Checking Alumni repository for ID: " + alumniId);
            Optional<Alumni> alumniOpt = alumniRepository.findById(alumniId);
            if (alumniOpt.isPresent()) {
                Alumni alumni = alumniOpt.get();
                System.out.println("Found alumni in Alumni repository: " + alumni.getName() + ", Status: " + alumni.getStatus());
                if (alumni.getStatus() == Alumni.AlumniStatus.APPROVED) {
                    alumniProfile = alumni;
                    System.out.println("Alumni is approved: " + alumniProfile.getName());
                } else {
                    System.out.println("Alumni found but not approved, status: " + alumni.getStatus());
                }
            } else {
                System.out.println("Alumni not found in Alumni repository");
            }
            
            // Fallback to User repository if not found in Alumni repository
            if (alumniProfile == null) {
                System.out.println("Checking User repository for ID: " + alumniId);
                Optional<User> userOpt = userRepository.findById(alumniId);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    System.out.println("Found user in User repository: " + user.getName() + ", Role: " + user.getRole());
                    if (user.getRole() == User.UserRole.ALUMNI) {
                        alumniUser = user;
                        System.out.println("User is alumni: " + alumniUser.getName());
                    } else {
                        System.out.println("User found but not alumni, role: " + user.getRole());
                    }
                } else {
                    System.out.println("User not found in User repository");
                }
            }
            
            // Check if we found an alumni
            if (alumniProfile == null && alumniUser == null) {
                System.out.println("Alumni not found in either repository!");
                throw new RuntimeException("Alumni not found");
            }
            
            // Create management-to-alumni event request
            Event event = new Event();
            event.setTitle((String) requestData.get("eventTitle"));
            event.setDescription((String) requestData.get("eventDescription"));
            event.setLocation((String) requestData.get("venue"));
            
            // Set department based on alumni source
            if (alumniProfile != null) {
                event.setDepartment(alumniProfile.getDepartment());
            } else if (alumniUser != null) {
                event.setDepartment(alumniUser.getDepartment());
            }
            
            event.setTargetAudience("All Students");
            
            // Parse proposed date and time
            String proposedDate = (String) requestData.get("proposedDate");
            String proposedTime = (String) requestData.get("proposedTime");
            String proposedEndTime = (String) requestData.get("proposedEndTime");
            
            if (proposedDate != null && proposedTime != null) {
                String dateTimeStr = proposedDate + "T" + proposedTime;
                LocalDateTime eventDateTime = LocalDateTime.parse(dateTimeStr);
                event.setStartDateTime(eventDateTime);
                
                // Set end time if provided, otherwise default to 2 hours later
                if (proposedEndTime != null && !proposedEndTime.isEmpty()) {
                    String endDateTimeStr = proposedDate + "T" + proposedEndTime;
                    LocalDateTime endDateTime = LocalDateTime.parse(endDateTimeStr);
                    event.setEndDateTime(endDateTime);
                } else {
                    event.setEndDateTime(eventDateTime.plusHours(2)); // Default 2 hours duration
                }
            }
            
            // Handle expected attendees
            Object attendeesObj = requestData.get("expectedAttendees");
            if (attendeesObj != null) {
                try {
                    event.setMaxAttendees(Integer.valueOf(attendeesObj.toString()));
                } catch (NumberFormatException e) {
                    event.setMaxAttendees(50);
                }
            } else {
                event.setMaxAttendees(50);
            }
            
            event.setSpecialRequirements((String) requestData.get("specialRequirements"));
            
            // Set contact info based on alumni source
            if (alumniProfile != null) {
                event.setContactEmail(alumniProfile.getEmail());
                event.setContactPhone(alumniProfile.getPhoneNumber());
                event.setOrganizerName(alumniProfile.getName());
                event.setOrganizerEmail(alumniProfile.getEmail());
            } else if (alumniUser != null) {
                event.setContactEmail(alumniUser.getEmail());
                event.setContactPhone(alumniUser.getPhone());
                event.setOrganizerName(alumniUser.getName());
                event.setOrganizerEmail(alumniUser.getEmail());
            }
            
            // Set as management requested event
            event.setOrganizerId(alumniId); // Alumni will be the organizer
            event.setRequestedBy(managementId); // Management who requested
            event.setRequestedByName(management.getName()); // Management name who requested
            event.setStatus(Event.EventStatus.PENDING); // Pending alumni acceptance
            event.setType(Event.EventType.MANAGEMENT_REQUESTED);
            event.setSubmittedAt(LocalDateTime.now());
            
            Event savedEvent = eventRepository.save(event);
            
            // Send notification to alumni
            String alumniEmail = null;
            if (alumniProfile != null) {
                alumniEmail = alumniProfile.getEmail();
            } else if (alumniUser != null && alumniUser.getEmail() != null) {
                alumniEmail = alumniUser.getEmail();
            }
            
            if (alumniEmail != null) {
                notificationService.sendManagementEventRequestNotification(
                    alumniEmail, 
                    event.getTitle(), 
                    management.getName()
                );
            }
            
            System.out.println("AlumniEventService: Management event request sent to alumni");
            
            return Map.of(
                "success", true,
                "message", "Event request sent to alumni successfully",
                "eventId", savedEvent.getId()
            );
            
        } catch (Exception e) {
            System.err.println("AlumniEventService: Error requesting event from alumni: " + e.getMessage());
            throw new RuntimeException("Failed to request event from alumni: " + e.getMessage());
        }
    }
    
    // Get pending management requests for alumni
    public List<Event> getPendingManagementRequests(String alumniId) {
        try {
            List<Event> events = eventRepository.findByOrganizerIdAndStatus(alumniId, Event.EventStatus.PENDING);
            // Filter only management requested events
            return events.stream()
                    .filter(event -> event.getType() == Event.EventType.MANAGEMENT_REQUESTED)
                    .toList();
        } catch (Exception e) {
            System.err.println("AlumniEventService: Error getting pending management requests: " + e.getMessage());
            throw new RuntimeException("Failed to get pending management requests: " + e.getMessage());
        }
    }
    
    // Alumni accepts management event request
    public Object acceptManagementEventRequest(String requestId, String alumniId, String response) {
        try {
            Optional<Event> eventOpt = eventRepository.findById(requestId);
            if (!eventOpt.isPresent()) {
                throw new RuntimeException("Event request not found");
            }
            
            Event event = eventOpt.get();
            
            if (!event.getOrganizerId().equals(alumniId)) {
                throw new RuntimeException("Unauthorized to respond to this request");
            }
            
            if (event.getStatus() != Event.EventStatus.PENDING) {
                throw new RuntimeException("Event request is not pending");
            }
            
            // Update event status to approved
            event.setStatus(Event.EventStatus.APPROVED);
            event.setApprovedAt(LocalDateTime.now());
            event.setApprovedBy(alumniId);
            
            Event savedEvent = eventRepository.save(event);
            
            // Update alumni events count when they accept a management request
            try {
                Optional<User> alumniUserOpt = userRepository.findById(alumniId);
                if (alumniUserOpt.isPresent()) {
                    User alumniUser = alumniUserOpt.get();
                    // Increment events count in User table for alumni stats
                    Integer currentEventsCount = alumniUser.getAiAssessmentCount(); // Reuse this field for events count temporarily
                    if (currentEventsCount == null) currentEventsCount = 0;
                    // For now, we'll track this in a different way since we don't have eventsCount field
                    System.out.println("Alumni " + alumniUser.getName() + " accepted a management event request");
                } else {
                    // Try to find in Alumni table and update corresponding User record
                    Optional<Alumni> alumniOpt = alumniRepository.findById(alumniId);
                    if (alumniOpt.isPresent()) {
                        Alumni alumni = alumniOpt.get();
                        Optional<User> userByEmail = userRepository.findByEmail(alumni.getEmail());
                        if (userByEmail.isPresent()) {
                            User user = userByEmail.get();
                            System.out.println("Alumni " + user.getName() + " (via email lookup) accepted a management event request");
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Error updating alumni events count: " + e.getMessage());
            }
            
            // Send notification to management
            User management = userRepository.findById(event.getApprovedBy())
                    .orElse(null);
            if (management != null) {
                notificationService.sendManagementEventResponseNotification(
                    management.getEmail(), 
                    event.getTitle(), 
                    true, 
                    response
                );
            }
            
            System.out.println("AlumniEventService: Alumni accepted management event request");
            
            return Map.of(
                "success", true,
                "message", "Event request accepted successfully",
                "event", savedEvent
            );
            
        } catch (Exception e) {
            System.err.println("AlumniEventService: Error accepting management request: " + e.getMessage());
            throw new RuntimeException("Failed to accept management request: " + e.getMessage());
        }
    }
    
    // Alumni rejects management event request
    public Object rejectManagementEventRequest(String requestId, String alumniId, String reason) {
        try {
            Optional<Event> eventOpt = eventRepository.findById(requestId);
            if (!eventOpt.isPresent()) {
                throw new RuntimeException("Event request not found");
            }
            
            Event event = eventOpt.get();
            
            if (!event.getOrganizerId().equals(alumniId)) {
                throw new RuntimeException("Unauthorized to respond to this request");
            }
            
            if (event.getStatus() != Event.EventStatus.PENDING) {
                throw new RuntimeException("Event request is not pending");
            }
            
            // Update event status to rejected
            event.setStatus(Event.EventStatus.REJECTED);
            event.setRejectedAt(LocalDateTime.now());
            event.setRejectedBy(alumniId);
            event.setRejectionReason(reason);
            
            Event savedEvent = eventRepository.save(event);
            
            // Send notification to management
            User management = userRepository.findById(event.getApprovedBy())
                    .orElse(null);
            if (management != null) {
                notificationService.sendManagementEventResponseNotification(
                    management.getEmail(), 
                    event.getTitle(), 
                    false, 
                    reason
                );
            }
            
            System.out.println("AlumniEventService: Alumni rejected management event request");
            
            return Map.of(
                "success", true,
                "message", "Event request rejected successfully",
                "event", savedEvent
            );
            
        } catch (Exception e) {
            System.err.println("AlumniEventService: Error rejecting management request: " + e.getMessage());
            throw new RuntimeException("Failed to reject management request: " + e.getMessage());
        }
    }
    
    // Get all management event requests
    public List<Event> getAllManagementEventRequests() {
        try {
            return eventRepository.findByType(Event.EventType.MANAGEMENT_REQUESTED);
        } catch (Exception e) {
            System.err.println("AlumniEventService: Error getting management requests: " + e.getMessage());
            throw new RuntimeException("Failed to get management event requests: " + e.getMessage());
        }
    }
    
    // Update attendance for an event
    public Event updateAttendance(String eventId, String userEmail, boolean attending) {
        try {
            // Find the event
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            
            // Find the user (check both User and Alumni repositories)
            User user = userRepository.findByEmail(userEmail).orElse(null);
            String userId;
            
            if (user != null) {
                userId = user.getId();
            } else {
                // Check Alumni repository if not in User repository
                // For now, we'll use the email as ID if user not found in User table
                userId = userEmail;
            }
            
            // Initialize attendees list if null
            if (event.getAttendees() == null) {
                event.setAttendees(new java.util.ArrayList<>());
            }
            
            // Update attendance
            if (attending) {
                // Add to attendees if not already present
                if (!event.getAttendees().contains(userId)) {
                    event.getAttendees().add(userId);
                }
            } else {
                // Remove from attendees
                event.getAttendees().remove(userId);
            }
            
            // Save and return updated event
            Event savedEvent = eventRepository.save(event);
            System.out.println("AlumniEventService: Updated attendance for event " + eventId + 
                             ", user " + userEmail + ", attending: " + attending + 
                             ", total attendees: " + savedEvent.getAttendees().size());
            
            return savedEvent;
            
        } catch (Exception e) {
            System.err.println("AlumniEventService: Error updating attendance: " + e.getMessage());
            throw new RuntimeException("Failed to update attendance: " + e.getMessage());
        }
    }
    
    // Count accepted events for an alumni
    public long getAlumniAcceptedEventsCount(String alumniEmail) {
        try {
            // Find alumni by email to get their ID
            String alumniId = null;
            
            // First try User table
            Optional<User> userOpt = userRepository.findByEmail(alumniEmail);
            if (userOpt.isPresent()) {
                alumniId = userOpt.get().getId();
            } else {
                // Try Alumni table
                Optional<Alumni> alumniOpt = alumniRepository.findByEmail(alumniEmail);
                if (alumniOpt.isPresent()) {
                    alumniId = alumniOpt.get().getId();
                }
            }
            
            if (alumniId == null) {
                System.out.println("Alumni not found for email: " + alumniEmail);
                return 0;
            }
            
            // Count events where this alumni is the organizer and status is APPROVED or COMPLETED
            // This includes both alumni-initiated events and management-requested events they accepted
            long eventsCount = 0;
            
            // Method 1: Count by organizer ID - include both APPROVED and COMPLETED events
            try {
                List<Event> approvedEvents = eventRepository.findByOrganizerIdAndStatus(alumniId, Event.EventStatus.APPROVED);
                List<Event> completedEvents = eventRepository.findByOrganizerIdAndStatus(alumniId, Event.EventStatus.COMPLETED);
                eventsCount += approvedEvents.size() + completedEvents.size();
                System.out.println("Events organized by ID - Approved: " + approvedEvents.size() + ", Completed: " + completedEvents.size());
            } catch (Exception e) {
                System.err.println("Error counting events by organizer ID: " + e.getMessage());
            }
            
            // Method 2: Count by organizer email (fallback) - include both APPROVED and COMPLETED events
            try {
                long approvedEmailEvents = eventRepository.countByOrganizerEmailAndStatus(alumniEmail, Event.EventStatus.APPROVED);
                long completedEmailEvents = eventRepository.countByOrganizerEmailAndStatus(alumniEmail, Event.EventStatus.COMPLETED);
                if (eventsCount == 0) { // Only use email count if ID count failed
                    eventsCount = approvedEmailEvents + completedEmailEvents;
                }
                System.out.println("Events organized by email - Approved: " + approvedEmailEvents + ", Completed: " + completedEmailEvents);
            } catch (Exception e) {
                System.err.println("Error counting events by organizer email: " + e.getMessage());
            }
            
            System.out.println("AlumniEventService: Alumni " + alumniEmail + " has organized " + eventsCount + " approved/completed events");
            return eventsCount;
        } catch (Exception e) {
            System.err.println("Error counting alumni events: " + e.getMessage());
            return 0;
        }
    }
    
    // Manual method to mark completed events (for testing or manual cleanup)
    public Object markCompletedEvents() {
        try {
            LocalDateTime now = LocalDateTime.now();
            
            // Find expired approved events
            List<Event> expiredEvents = eventRepository.findExpiredApprovedEvents(now);
            
            if (!expiredEvents.isEmpty()) {
                System.out.println("AlumniEventService: Marking " + expiredEvents.size() + " expired events as completed");
                
                for (Event event : expiredEvents) {
                    event.setStatus(Event.EventStatus.COMPLETED);
                    System.out.println("Marked as completed: " + event.getTitle());
                }
                
                eventRepository.saveAll(expiredEvents);
                
                return Map.of(
                    "success", true,
                    "message", "Marked " + expiredEvents.size() + " events as completed",
                    "eventsCompleted", expiredEvents.size()
                );
            } else {
                return Map.of(
                    "success", true,
                    "message", "No expired events found to mark as completed",
                    "eventsCompleted", 0
                );
            }
        } catch (Exception e) {
            System.err.println("Error marking completed events: " + e.getMessage());
            throw new RuntimeException("Failed to mark completed events: " + e.getMessage());
        }
    }
}