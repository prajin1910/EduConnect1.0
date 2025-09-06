package com.stjoseph.assessmentsystem.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.stjoseph.assessmentsystem.model.Event;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    
    // Find events by status
    List<Event> findByStatus(Event.EventStatus status);
    
    // Find events by organizer
    List<Event> findByOrganizerId(String organizerId);
    
    // Find events by type
    List<Event> findByType(Event.EventType type);
    
    // Find approved events that are upcoming
    @Query("{ 'status': 'APPROVED', 'startDateTime': { $gte: ?0 } }")
    List<Event> findUpcomingApprovedEvents(LocalDateTime fromDate);
    
    // Find events that have ended (for cleanup)
    @Query("{ 'endDateTime': { $lt: ?0 } }")
    List<Event> findExpiredEvents(LocalDateTime beforeDate);
    
    // Find approved events that have ended (for marking as completed)
    @Query("{ 'status': 'APPROVED', 'endDateTime': { $lt: ?0 } }")
    List<Event> findExpiredApprovedEvents(LocalDateTime beforeDate);
    
    // Find very old completed events (for archival)
    @Query("{ 'status': 'COMPLETED', 'endDateTime': { $lt: ?0 } }")
    List<Event> findVeryOldCompletedEvents(LocalDateTime beforeDate);
    
    // Find pending events
    @Query("{ 'status': 'PENDING' }")
    List<Event> findPendingEvents();
    
    // Find approved events
    @Query("{ 'status': 'APPROVED' }")
    List<Event> findApprovedEvents();
    
    // Find events by organizer and status
    List<Event> findByOrganizerIdAndStatus(String organizerId, Event.EventStatus status);
    
    // Find alumni initiated events
    @Query("{ 'type': 'ALUMNI_INITIATED' }")
    List<Event> findAlumniInitiatedEvents();
    
    // Find management requested events
    @Query("{ 'type': 'MANAGEMENT_REQUESTED' }")
    List<Event> findManagementRequestedEvents();
    
    // Count events by status
    long countByStatus(Event.EventStatus status);
    
    // Count events by organizer email and status
    @Query("{ 'organizerEmail': ?0, 'status': ?1 }")
    long countByOrganizerEmailAndStatus(String organizerEmail, Event.EventStatus status);
}
