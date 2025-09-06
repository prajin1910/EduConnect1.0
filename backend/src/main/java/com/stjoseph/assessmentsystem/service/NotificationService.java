package com.stjoseph.assessmentsystem.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stjoseph.assessmentsystem.model.Connection;
import com.stjoseph.assessmentsystem.model.Notification;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.ConnectionRepository;
import com.stjoseph.assessmentsystem.repository.NotificationRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;

@Service
public class NotificationService {
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ConnectionRepository connectionRepository;
    
    public void sendEventApprovalNotification(String alumniEmail, String eventTitle, boolean approved, String reason) {
        try {
            if (approved) {
                String subject = "Event Request Approved - " + eventTitle;
                String message = "Your event request for '" + eventTitle + "' has been approved by the management team. " +
                               "We will contact you soon with further details regarding the event logistics.";
                emailService.sendSimpleMessage(alumniEmail, subject, message);
                System.out.println("Sent approval notification to: " + alumniEmail);
            } else {
                String subject = "Event Request Update - " + eventTitle;
                String message = "Your event request for '" + eventTitle + "' could not be approved at this time.";
                if (reason != null && !reason.isEmpty()) {
                    message += " Reason: " + reason;
                }
                message += " Please feel free to submit a revised request or contact us for more information.";
                emailService.sendSimpleMessage(alumniEmail, subject, message);
                System.out.println("Sent rejection notification to: " + alumniEmail);
            }
        } catch (Exception e) {
            System.err.println("Failed to send event notification: " + e.getMessage());
        }
    }
    
    public void sendNewEventRequestNotification(String eventTitle) {
        try {
            System.out.println("New event request received: " + eventTitle);
            // In a real application, this would notify management via email or dashboard
            // For now, we'll just log it
        } catch (Exception e) {
            System.err.println("Failed to send new event request notification: " + e.getMessage());
        }
    }
    
    public void sendGeneralNotification(String email, String subject, String message) {
        try {
            emailService.sendSimpleMessage(email, subject, message);
            System.out.println("Sent notification to: " + email);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }
    
    public void sendManagementEventRequestNotification(String alumniEmail, String eventTitle, String managementName) {
        try {
            String subject = "Event Request from Management - " + eventTitle;
            String message = "Dear Alumni,\n\n" +
                           "The management team (" + managementName + ") has requested you to organize an event titled '" + eventTitle + "'.\n" +
                           "Please log into your dashboard to review the event details and respond to this request.\n\n" +
                           "Best regards,\nSt. Joseph Assessment System";
            emailService.sendSimpleMessage(alumniEmail, subject, message);
            System.out.println("Sent management event request notification to: " + alumniEmail);
        } catch (Exception e) {
            System.err.println("Failed to send management event request notification: " + e.getMessage());
        }
    }
    
    public void sendManagementEventResponseNotification(String managementEmail, String eventTitle, boolean accepted, String response) {
        try {
            if (accepted) {
                String subject = "Event Request Accepted - " + eventTitle;
                String message = "Great news! The alumni has accepted your event request for '" + eventTitle + "'.\n" +
                               "Alumni Response: " + response + "\n\n" +
                               "The event details have been published for students and professors to view.\n\n" +
                               "Best regards,\nSt. Joseph Assessment System";
                emailService.sendSimpleMessage(managementEmail, subject, message);
                System.out.println("Sent event acceptance notification to management: " + managementEmail);
            } else {
                String subject = "Event Request Declined - " + eventTitle;
                String message = "The alumni has declined your event request for '" + eventTitle + "'.\n" +
                               "Reason: " + response + "\n\n" +
                               "The request has been permanently removed from the system. You may contact the alumni directly or submit a new request.\n\n" +
                               "Best regards,\nSt. Joseph Assessment System";
                emailService.sendSimpleMessage(managementEmail, subject, message);
                System.out.println("Sent event rejection notification to management: " + managementEmail);
            }
        } catch (Exception e) {
            System.err.println("Failed to send management event response notification: " + e.getMessage());
        }
    }
    
    // In-app notification methods
    
    // Create notification for approved events (notify all professors and students)
    public void createEventApprovedNotification(String eventId, String eventTitle, String eventDescription, LocalDateTime eventDateTime) {
        // Get all users except alumni
        List<User> allUsers = userRepository.findAll();
        List<String> recipients = allUsers.stream()
                .filter(user -> user.getRole() != User.UserRole.ALUMNI)
                .map(User::getId)
                .collect(Collectors.toList());
        
        String formattedDate = eventDateTime.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a"));
        
        Notification notification = new Notification();
        notification.setTitle("New Event Approved");
        notification.setMessage(String.format("A new event '%s' has been scheduled for %s", 
                eventTitle, formattedDate));
        notification.setType(Notification.NotificationType.EVENT_APPROVED);
        notification.setEventId(eventId);
        notification.setEventTitle(eventTitle);
        notification.setEventDate(eventDateTime);
        notification.setRecipients(recipients);
        notification.setReadBy(new ArrayList<>());
        
        notificationRepository.save(notification);
    }
    
    // Create notification when event is rejected
    public void createEventRejectedNotification(String eventId, String eventTitle, String organizerName, String reason, String alumniId) {
        List<String> recipients = List.of(alumniId);
        
        Notification notification = new Notification();
        notification.setTitle("Event Request Rejected");
        notification.setMessage(String.format("Your event request '%s' has been rejected. Reason: %s", 
                eventTitle, reason != null ? reason : "Not specified"));
        notification.setType(Notification.NotificationType.EVENT_REJECTED);
        notification.setEventId(eventId);
        notification.setEventTitle(eventTitle);
        notification.setOrganizerName(organizerName);
        notification.setRecipients(recipients);
        notification.setReadBy(new ArrayList<>());
        
        notificationRepository.save(notification);
    }
    
    // Create notification for upcoming events
    public void createUpcomingEventNotification(String eventId, String eventTitle, String organizerName, LocalDateTime eventDate) {
        // Get all users
        List<User> allUsers = userRepository.findAll();
        List<String> recipients = allUsers.stream()
                .map(User::getId)
                .collect(Collectors.toList());
        
        String formattedDate = eventDate.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a"));
        
        Notification notification = new Notification();
        notification.setTitle("Upcoming Event Reminder");
        notification.setMessage(String.format("Reminder: Event '%s' is scheduled for %s, conducted by %s", 
                eventTitle, formattedDate, organizerName));
        notification.setType(Notification.NotificationType.EVENT_UPCOMING);
        notification.setEventId(eventId);
        notification.setEventTitle(eventTitle);
        notification.setOrganizerName(organizerName);
        notification.setEventDate(eventDate);
        notification.setRecipients(recipients);
        notification.setReadBy(new ArrayList<>());
        
        notificationRepository.save(notification);
    }
    
    // Get notifications for a specific user
    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByRecipientsContaining(userId);
    }
    
    // Get unread notifications for a user
    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findUnreadByUser(userId);
    }
    
    // Mark notification as read
    public void markAsRead(String notificationId, String userId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            if (notification.getReadBy() == null) {
                notification.setReadBy(new ArrayList<>());
            }
            if (!notification.getReadBy().contains(userId)) {
                notification.getReadBy().add(userId);
                notificationRepository.save(notification);
            }
        }
    }
    
    // Get notification count for a user
    public long getUnreadCount(String userId) {
        return getUnreadNotifications(userId).size();
    }
    
    // Connection notification methods
    public void createConnectionRequestNotification(String recipientId, String senderId, String senderName) {
        try {
            System.out.println("NotificationService: Creating connection request notification");
            System.out.println("Recipient ID: " + recipientId + ", Sender ID: " + senderId + ", Sender Name: " + senderName);
            
            Notification notification = new Notification();
            notification.setType(Notification.NotificationType.CONNECTION_REQUEST);
            notification.setTitle("New Connection Request");
            notification.setMessage(senderName + " wants to connect with you on the Alumni Network");
            notification.setRecipients(List.of(recipientId));
            notification.setRelatedEntityId(senderId);
            
            notificationRepository.save(notification);
            System.out.println("NotificationService: Connection request notification created successfully");
        } catch (Exception e) {
            System.err.println("Error creating connection request notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public void createConnectionAcceptedNotification(String senderId, String recipientId, String recipientName) {
        try {
            Notification notification = new Notification();
            notification.setType(Notification.NotificationType.CONNECTION_ACCEPTED);
            notification.setTitle("Connection Accepted");
            notification.setMessage(recipientName + " accepted your connection request");
            notification.setRecipients(List.of(senderId));
            notification.setRelatedEntityId(recipientId);
            
            notificationRepository.save(notification);
        } catch (Exception e) {
            System.err.println("Error creating connection accepted notification: " + e.getMessage());
        }
    }
    
    public void createNewFollowerNotification(String alumniId, String followerId, String followerName) {
        try {
            System.out.println("NotificationService: Creating new follower notification");
            System.out.println("Alumni ID: " + alumniId + ", Follower ID: " + followerId + ", Follower Name: " + followerName);
            
            Notification notification = new Notification();
            notification.setType(Notification.NotificationType.NEW_FOLLOWER);
            notification.setTitle("New Follower");
            notification.setMessage(followerName + " is now following you");
            notification.setRecipients(List.of(alumniId));
            notification.setRelatedEntityId(followerId);
            
            notificationRepository.save(notification);
            System.out.println("NotificationService: New follower notification created successfully");
        } catch (Exception e) {
            System.err.println("Error creating new follower notification: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public void createJobPostNotification(String alumniId, String alumniName, String jobTitle) {
        try {
            // Get all users who are following this alumni (recipients of the alumni)
            List<Connection> followingConnections = connectionRepository.findByRecipientIdAndStatus(alumniId, Connection.ConnectionStatus.ACCEPTED);
            List<String> followerIds = followingConnections.stream()
                .map(Connection::getSenderId)
                .collect(Collectors.toList());
            
            if (!followerIds.isEmpty()) {
                Notification notification = new Notification();
                notification.setType(Notification.NotificationType.JOB_POST);
                notification.setTitle("New Job Opportunity");
                notification.setMessage(alumniName + " posted a new job: " + jobTitle);
                notification.setRecipients(followerIds);
                notification.setRelatedEntityId(alumniId);
                
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            System.err.println("Error creating job post notification: " + e.getMessage());
        }
    }
}
