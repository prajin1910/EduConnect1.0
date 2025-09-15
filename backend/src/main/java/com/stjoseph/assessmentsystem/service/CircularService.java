package com.stjoseph.assessmentsystem.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stjoseph.assessmentsystem.dto.CircularRequest;
import com.stjoseph.assessmentsystem.model.Circular;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.CircularRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;

@Service
public class CircularService {

    @Autowired
    private CircularRepository circularRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    // Helper method to get user ID from email
    private String getUserIdFromEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("User not found: " + email);
        }
        return userOpt.get().getId();
    }

    // Create and send a circular
    public Circular createCircular(CircularRequest request, String userEmail) {
        // Get sender information by email
        Optional<User> senderOpt = userRepository.findByEmail(userEmail);
        if (!senderOpt.isPresent()) {
            throw new RuntimeException("Sender not found");
        }
        
        User sender = senderOpt.get();
        
        // Validate sender permissions
        validateSenderPermissions(sender, request.getRecipientTypes());
        
        // Create circular
        Circular circular = new Circular();
        circular.setTitle(request.getTitle());
        circular.setBody(request.getBody());
        circular.setSenderId(sender.getId());
        circular.setSenderName(sender.getName());
        circular.setSenderRole(mapUserRoleToSenderRole(sender.getRole()));
        circular.setRecipientTypes(request.getRecipientTypes());
        circular.setCreatedAt(LocalDateTime.now());
        circular.setUpdatedAt(LocalDateTime.now());
        circular.setStatus(Circular.CircularStatus.ACTIVE);
        circular.setReadBy(new ArrayList<>());
        
        // Determine recipients based on recipient types
        List<String> recipients = determineRecipients(request.getRecipientTypes(), sender.getId());
        circular.setRecipients(recipients);
        
        // Save circular
        Circular savedCircular = circularRepository.save(circular);
        
        // Create notifications for recipients
        createCircularNotifications(savedCircular, recipients);
        
        return savedCircular;
    }
    
    // Get circulars for a specific user (what they can see)
    public List<Circular> getCircularsForUser(String userEmail) {
        String userId = getUserIdFromEmail(userEmail);
        return circularRepository.findActiveCircularsByRecipient(userId);
    }
    
    // Get circulars sent by a user
    public List<Circular> getCircularsSentByUser(String userEmail) {
        String userId = getUserIdFromEmail(userEmail);
        return circularRepository.findBySenderIdOrderByCreatedAtDesc(userId);
    }
    
    // Mark circular as read
    public void markCircularAsRead(String circularId, String userEmail) {
        String userId = getUserIdFromEmail(userEmail);
        Optional<Circular> circularOpt = circularRepository.findById(circularId);
        if (circularOpt.isPresent()) {
            Circular circular = circularOpt.get();
            if (circular.getReadBy() == null) {
                circular.setReadBy(new ArrayList<>());
            }
            if (!circular.getReadBy().contains(userId)) {
                circular.getReadBy().add(userId);
                circular.setUpdatedAt(LocalDateTime.now());
                circularRepository.save(circular);
            }
        }
    }
    
    // Get unread circular count for a user
    public long getUnreadCircularCount(String userEmail) {
        String userId = getUserIdFromEmail(userEmail);
        return circularRepository.countUnreadCircularsByRecipient(userId);
    }
    
    // Archive a circular (only sender can do this)
    public void archiveCircular(String circularId, String userEmail) {
        String userId = getUserIdFromEmail(userEmail);
        Optional<Circular> circularOpt = circularRepository.findById(circularId);
        if (circularOpt.isPresent()) {
            Circular circular = circularOpt.get();
            if (!circular.getSenderId().equals(userId)) {
                throw new RuntimeException("Only the sender can archive this circular");
            }
            circular.setStatus(Circular.CircularStatus.ARCHIVED);
            circular.setUpdatedAt(LocalDateTime.now());
            circularRepository.save(circular);
        }
    }
    
    // Get a specific circular by ID (if user has access)
    public Circular getCircularById(String circularId, String userEmail) {
        String userId = getUserIdFromEmail(userEmail);
        Optional<Circular> circularOpt = circularRepository.findById(circularId);
        if (circularOpt.isPresent()) {
            Circular circular = circularOpt.get();
            // Check if user has access (either sender or recipient)
            if (circular.getSenderId().equals(userId) || 
                (circular.getRecipients() != null && circular.getRecipients().contains(userId))) {
                return circular;
            }
        }
        throw new RuntimeException("Circular not found or access denied");
    }
    
    // Helper method to validate sender permissions
    private void validateSenderPermissions(User sender, List<Circular.RecipientType> recipientTypes) {
        User.UserRole senderRole = sender.getRole();
        
        for (Circular.RecipientType recipientType : recipientTypes) {
            switch (recipientType) {
                case MANAGEMENT:
                    // Only professors can send to management, management can send to themselves
                    if (senderRole != User.UserRole.PROFESSOR && senderRole != User.UserRole.MANAGEMENT) {
                        throw new RuntimeException("You don't have permission to send circulars to management");
                    }
                    break;
                case PROFESSORS:
                    // Management and professors can send to professors
                    if (senderRole != User.UserRole.MANAGEMENT && senderRole != User.UserRole.PROFESSOR) {
                        throw new RuntimeException("You don't have permission to send circulars to professors");
                    }
                    break;
                case STUDENTS:
                    // Management and professors can send to students
                    if (senderRole != User.UserRole.MANAGEMENT && senderRole != User.UserRole.PROFESSOR) {
                        throw new RuntimeException("You don't have permission to send circulars to students");
                    }
                    break;
                case ALL:
                    // Only management can send to all
                    if (senderRole != User.UserRole.MANAGEMENT) {
                        throw new RuntimeException("Only management can send circulars to all users");
                    }
                    break;
            }
        }
    }
    
    // Helper method to determine recipients
    private List<String> determineRecipients(List<Circular.RecipientType> recipientTypes, String senderId) {
        Set<String> recipientIds = new HashSet<>();
        
        for (Circular.RecipientType recipientType : recipientTypes) {
            switch (recipientType) {
                case STUDENTS:
                    List<User> students = userRepository.findByRole(User.UserRole.STUDENT);
                    recipientIds.addAll(students.stream().map(User::getId).collect(Collectors.toList()));
                    break;
                case PROFESSORS:
                    List<User> professors = userRepository.findByRole(User.UserRole.PROFESSOR);
                    recipientIds.addAll(professors.stream().map(User::getId).collect(Collectors.toList()));
                    break;
                case MANAGEMENT:
                    List<User> management = userRepository.findByRole(User.UserRole.MANAGEMENT);
                    recipientIds.addAll(management.stream().map(User::getId).collect(Collectors.toList()));
                    break;
                case ALL:
                    List<User> allUsers = userRepository.findAll();
                    recipientIds.addAll(allUsers.stream()
                        .filter(user -> user.getRole() != User.UserRole.ALUMNI) // Exclude alumni
                        .map(User::getId)
                        .collect(Collectors.toList()));
                    break;
            }
        }
        
        // Remove sender from recipients to avoid self-notification
        recipientIds.remove(senderId);
        
        return new ArrayList<>(recipientIds);
    }
    
    // Helper method to map User.UserRole to Circular.SenderRole
    private Circular.SenderRole mapUserRoleToSenderRole(User.UserRole userRole) {
        switch (userRole) {
            case MANAGEMENT:
                return Circular.SenderRole.MANAGEMENT;
            case PROFESSOR:
                return Circular.SenderRole.PROFESSOR;
            case STUDENT:
                return Circular.SenderRole.STUDENT;
            default:
                throw new RuntimeException("Invalid sender role");
        }
    }
    
    // Helper method to create notifications for circular recipients
    private void createCircularNotifications(Circular circular, List<String> recipients) {
        try {
            // Create a circular notification (we'll need to add this type to NotificationService)
            String title = "New Circular: " + circular.getTitle();
            String message = "You have received a new circular from " + circular.getSenderName() + 
                           " (" + circular.getSenderRole().toString().toLowerCase() + ")";
            
            // For now, we'll create individual notifications for each recipient
            // This could be optimized later to use bulk notifications
            for (String recipientId : recipients) {
                try {
                    notificationService.createCircularNotification(
                        recipientId, 
                        circular.getId(), 
                        title, 
                        message, 
                        circular.getSenderName(),
                        circular.getSenderRole().toString()
                    );
                } catch (Exception e) {
                    System.err.println("Failed to create notification for recipient " + recipientId + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to create circular notifications: " + e.getMessage());
        }
    }
    
    // Get all circulars for management dashboard
    public List<Circular> getAllCirculars() {
        return circularRepository.findByStatusOrderByCreatedAtDesc(Circular.CircularStatus.ACTIVE);
    }
    
    // Get statistics
    public Map<String, Object> getCircularStats(String userEmail) {
        Map<String, Object> stats = new HashMap<>();
        
        // Get user to determine role
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String userId = user.getId();
            
            // Stats for sent circulars (if user can send)
            if (user.getRole() == User.UserRole.MANAGEMENT || user.getRole() == User.UserRole.PROFESSOR) {
                List<Circular> sentCirculars = circularRepository.findBySenderIdOrderByCreatedAtDesc(userId);
                stats.put("sentCount", sentCirculars.size());
            }
            
            // Stats for received circulars
            List<Circular> receivedCirculars = circularRepository.findActiveCircularsByRecipient(userId);
            long unreadCount = circularRepository.countUnreadCircularsByRecipient(userId);
            
            stats.put("receivedCount", receivedCirculars.size());
            stats.put("unreadCount", unreadCount);
            stats.put("readCount", receivedCirculars.size() - unreadCount);
        }
        
        return stats;
    }
}
