package com.stjoseph.assessmentsystem.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.stjoseph.assessmentsystem.model.Event;
import com.stjoseph.assessmentsystem.repository.EventRepository;

@Service
public class EventCleanupService {
    
    @Autowired
    private EventRepository eventRepository;
    
    // Run every hour to check for expired events
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void cleanupExpiredEvents() {
        try {
            System.out.println("Running event cleanup task...");
            
            LocalDateTime now = LocalDateTime.now();
            
            // Get all approved events that have ended (expired events)
            List<Event> expiredEvents = eventRepository.findExpiredApprovedEvents(now);
            
            if (!expiredEvents.isEmpty()) {
                System.out.println("Found " + expiredEvents.size() + " expired events to mark as completed");
                
                for (Event event : expiredEvents) {
                    System.out.println("Marking event as completed: " + event.getTitle() + " (ended at: " + event.getEndDateTime() + ")");
                    
                    // Mark event as COMPLETED instead of deleting
                    event.setStatus(Event.EventStatus.COMPLETED);
                }
                
                // Save all updated events as COMPLETED
                eventRepository.saveAll(expiredEvents);
                System.out.println("Successfully marked " + expiredEvents.size() + " expired events as completed");
            } else {
                System.out.println("No expired approved events found");
            }
            
            // Clean up very old completed events (older than 1 year) for database maintenance
            LocalDateTime oneYearAgo = now.minusYears(1);
            List<Event> veryOldCompletedEvents = eventRepository.findVeryOldCompletedEvents(oneYearAgo);
            
            if (!veryOldCompletedEvents.isEmpty()) {
                System.out.println("Found " + veryOldCompletedEvents.size() + " very old completed events (>1 year) to archive");
                
                // Delete very old completed events to keep database clean
                eventRepository.deleteAll(veryOldCompletedEvents);
                System.out.println("Successfully archived " + veryOldCompletedEvents.size() + " very old events");
            }
            
        } catch (Exception e) {
            System.err.println("Error during event cleanup: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
