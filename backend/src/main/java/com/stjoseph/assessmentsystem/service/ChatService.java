package com.stjoseph.assessmentsystem.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.stjoseph.assessmentsystem.dto.ChatRequest;
import com.stjoseph.assessmentsystem.model.Alumni;
import com.stjoseph.assessmentsystem.model.ChatMessage;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.AlumniRepository;
import com.stjoseph.assessmentsystem.repository.ChatMessageRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;

@Service
public class ChatService {
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AlumniRepository alumniRepository;
    
    @Autowired
    private AIService aiService;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private ActivityService activityService;
    
    public List<Map<String, Object>> getConversations(String userEmail) {
        System.out.println("ChatService: === START getConversations for: " + userEmail + " ===");
        
        // Find user - try User table first, then Alumni table
        User user = null;
        Alumni alumniUser = null;
        final String userId;
        
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isPresent()) {
            user = userOpt.get();
            userId = user.getId();
            System.out.println("ChatService: Found user in User table - ID: " + userId + ", Name: " + user.getName());
        } else {
            // Try Alumni table if not found in User table
            Optional<Alumni> alumniOpt = alumniRepository.findByEmail(userEmail);
            if (alumniOpt.isPresent() && alumniOpt.get().getStatus() == Alumni.AlumniStatus.APPROVED) {
                alumniUser = alumniOpt.get();
                userId = alumniUser.getId();
                System.out.println("ChatService: Found user in Alumni table - ID: " + userId + ", Name: " + alumniUser.getName());
            } else {
                throw new RuntimeException("User not found");
            }
        }
        
        // Get all chat messages involving this user
        List<ChatMessage> allMessages = chatMessageRepository.findByUserInvolved(userId);
        System.out.println("ChatService: Found " + allMessages.size() + " total messages for user " + userId);
        
        // Group by conversation partner
        Map<String, List<ChatMessage>> conversationMap = new HashMap<>();
        
        for (ChatMessage message : allMessages) {
            String partnerId = message.getSenderId().equals(userId) ? 
                              message.getReceiverId() : message.getSenderId();
            
            if (!"AI".equals(partnerId)) { // Exclude AI conversations
                conversationMap.computeIfAbsent(partnerId, k -> new ArrayList<>()).add(message);
            }
        }
        
        System.out.println("ChatService: Found " + conversationMap.size() + " unique conversation partners");
        
        // Create conversation objects
        List<Map<String, Object>> conversations = new ArrayList<>();
        
        for (Map.Entry<String, List<ChatMessage>> entry : conversationMap.entrySet()) {
            String partnerId = entry.getKey();
            List<ChatMessage> messages = entry.getValue();
            
            System.out.println("ChatService: Processing conversation with partner ID: " + partnerId + " (" + messages.size() + " messages)");
            
            // Try to find partner in User table first, then Alumni table
            User partner = userRepository.findById(partnerId).orElse(null);
            Alumni partnerAlumni = null;
            
            if (partner == null) {
                partnerAlumni = alumniRepository.findById(partnerId).orElse(null);
                if (partnerAlumni == null || partnerAlumni.getStatus() != Alumni.AlumniStatus.APPROVED) {
                    System.out.println("ChatService: Partner not found or not approved, skipping partner ID: " + partnerId);
                    continue; // Skip if partner not found or not approved
                }
                System.out.println("ChatService: Found partner in Alumni table: " + partnerAlumni.getName());
            } else {
                System.out.println("ChatService: Found partner in User table: " + partner.getName());
            }
            
            // Get latest message
            ChatMessage latestMessage = messages.stream()
                    .max((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()))
                    .orElse(null);
            
            // Count unread messages
            long unreadCount = messages.stream()
                    .filter(m -> !m.isRead() && !m.getSenderId().equals(userId))
                    .count();
            
            Map<String, Object> conversation = new HashMap<>();
            
            Map<String, Object> userMap = new HashMap<>();
            if (partner != null) {
                userMap.put("id", partner.getId());
                userMap.put("name", partner.getName());
                userMap.put("email", partner.getEmail());
                userMap.put("role", partner.getRole().name());
                userMap.put("department", partner.getDepartment());
            } else {
                userMap.put("id", partnerAlumni.getId());
                userMap.put("name", partnerAlumni.getName());
                userMap.put("email", partnerAlumni.getEmail());
                userMap.put("role", "ALUMNI");
                userMap.put("department", partnerAlumni.getDepartment());
            }
            
            conversation.put("user", userMap);
            conversation.put("lastMessage", latestMessage);
            conversation.put("unreadCount", unreadCount);
            
            conversations.add(conversation);
        }
        
        // Sort by latest message timestamp
        conversations.sort((c1, c2) -> {
            ChatMessage m1 = (ChatMessage) c1.get("lastMessage");
            ChatMessage m2 = (ChatMessage) c2.get("lastMessage");
            if (m1 == null && m2 == null) return 0;
            if (m1 == null) return 1;
            if (m2 == null) return -1;
            return m2.getTimestamp().compareTo(m1.getTimestamp());
        });
        
        System.out.println("ChatService: Returning " + conversations.size() + " conversations");
        System.out.println("ChatService: === END getConversations ===");
        
        return conversations;
    }
    
    public List<Map<String, Object>> getAllChatUsers(String userEmail) {
        System.out.println("ChatService: === START getAllChatUsers for: " + userEmail + " ===");
        
        // Try to find user in User table first
        User currentUser = null;
        Alumni currentAlumni = null;
        
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isPresent()) {
            currentUser = userOpt.get();
            System.out.println("ChatService: Current user found in User table - ID: " + currentUser.getId() + ", Role: " + currentUser.getRole() + ", Name: " + currentUser.getName());
        } else {
            // If not in User table, check Alumni table
            Optional<Alumni> alumniOpt = alumniRepository.findByEmail(userEmail);
            if (alumniOpt.isPresent() && alumniOpt.get().getStatus() == Alumni.AlumniStatus.APPROVED) {
                currentAlumni = alumniOpt.get();
                System.out.println("ChatService: Current user found in Alumni table - ID: " + currentAlumni.getId() + ", Name: " + currentAlumni.getName());
            } else {
                throw new RuntimeException("User not found in either User or Alumni table, or alumni not approved");
            }
        }
        
        // Get current user ID for filtering
        String currentUserId = currentUser != null ? currentUser.getId() : currentAlumni.getId();
        String currentUserEmail = currentUser != null ? currentUser.getEmail() : currentAlumni.getEmail();
        
        // Get all users from User table except current user
        List<User> allUsers = userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUserId) && !user.getEmail().equals(currentUserEmail) && user.isVerified())
                .collect(Collectors.toList());
        
        System.out.println("ChatService: Found " + allUsers.size() + " verified users from User table (excluding current user)");
        
        // Log all users being processed
        allUsers.forEach(user -> {
            System.out.println("  - User: " + user.getName() + " (" + user.getEmail() + ") - Role: " + user.getRole() + ", Verified: " + user.isVerified());
        });
        
        // Also get all approved alumni from Alumni table
        List<Alumni> approvedAlumni = alumniRepository.findByStatus(Alumni.AlumniStatus.APPROVED);
        
        System.out.println("ChatService: Found " + approvedAlumni.size() + " approved alumni from Alumni table");
        
        List<Map<String, Object>> userMaps = new ArrayList<>();
        
        // Add users from User table
        for (User user : allUsers) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("name", user.getName());
            userMap.put("email", user.getEmail());
            userMap.put("role", user.getRole().name());
            userMap.put("department", user.getDepartment());
            userMaps.add(userMap);
        }
        
        System.out.println("ChatService: Added " + userMaps.size() + " users from User table");
        
        // Add alumni from Alumni table (if not already in User table and not current user)
        Set<String> existingEmails = allUsers.stream().map(User::getEmail).collect(Collectors.toSet());
        int alumniAdded = 0;
        for (Alumni alumni : approvedAlumni) {
            // Only add if not already in User table and not current user
            if (!existingEmails.contains(alumni.getEmail()) && !alumni.getEmail().equals(currentUserEmail) && !alumni.getId().equals(currentUserId)) {
                Map<String, Object> alumniMap = new HashMap<>();
                alumniMap.put("id", alumni.getId());
                alumniMap.put("name", alumni.getName());
                alumniMap.put("email", alumni.getEmail());
                alumniMap.put("role", "ALUMNI");
                alumniMap.put("department", alumni.getDepartment());
                userMaps.add(alumniMap);
                alumniAdded++;
            }
        }
        
        System.out.println("ChatService: Added " + alumniAdded + " additional alumni from Alumni table");
        System.out.println("ChatService: Total users returned: " + userMaps.size());
        
        // Log role breakdown
        Map<String, Long> roleBreakdown = userMaps.stream()
                .collect(Collectors.groupingBy(
                    user -> (String) user.get("role"),
                    Collectors.counting()
                ));
        System.out.println("ChatService: Role breakdown: " + roleBreakdown);
        
        // Log specific users by role for debugging
        userMaps.stream()
                .filter(user -> "PROFESSOR".equals(user.get("role")))
                .forEach(user -> System.out.println("  PROFESSOR: " + user.get("name") + " (" + user.get("email") + ")"));
        
        System.out.println("ChatService: === END getAllChatUsers ===");
        
        return userMaps;
    }
    
    public void markMessagesAsRead(String userEmail, String partnerId) {
        // Find user - try User table first, then Alumni table
        User user = null;
        Alumni alumniUser = null;
        final String userId;
        
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isPresent()) {
            user = userOpt.get();
            userId = user.getId();
        } else {
            // Try Alumni table if not found in User table
            Optional<Alumni> alumniOpt = alumniRepository.findByEmail(userEmail);
            if (alumniOpt.isPresent() && alumniOpt.get().getStatus() == Alumni.AlumniStatus.APPROVED) {
                alumniUser = alumniOpt.get();
                userId = alumniUser.getId();
            } else {
                throw new RuntimeException("User not found");
            }
        }
        
        // Update messages as read using a custom query approach
        List<ChatMessage> unreadMessages = chatMessageRepository.findAll().stream()
                .filter(msg -> msg.getSenderId().equals(partnerId) && 
                              msg.getReceiverId().equals(userId) && 
                              !msg.isRead())
                .collect(Collectors.toList());
        
        unreadMessages.forEach(msg -> {
            msg.setRead(true);
            chatMessageRepository.save(msg);
        });
    }
    
    public String chatWithAI(ChatRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String response = aiService.generateChatResponse(request);
        
        // Save user message
        ChatMessage userMessage = new ChatMessage();
        userMessage.setSenderId(user.getId());
        userMessage.setSenderName(user.getName());
        userMessage.setReceiverId("AI");
        userMessage.setReceiverName("AI Assistant");
        userMessage.setMessage(request.getMessage());
        userMessage.setType(ChatMessage.MessageType.AI_CHAT);
        chatMessageRepository.save(userMessage);
        
        // Save AI response
        ChatMessage aiMessage = new ChatMessage();
        aiMessage.setSenderId("AI");
        aiMessage.setSenderName("AI Assistant");
        aiMessage.setReceiverId(user.getId());
        aiMessage.setReceiverName(user.getName());
        aiMessage.setMessage(response);
        aiMessage.setType(ChatMessage.MessageType.AI_CHAT);
        chatMessageRepository.save(aiMessage);
        
        // Log activity
        try {
            activityService.logActivityByUserId(user.getId(), "AI_CHAT", "Chatted with AI assistant");
            System.out.println("ChatService: Activity logged for AI chat");
        } catch (Exception e) {
            System.err.println("ChatService: Failed to log AI chat activity: " + e.getMessage());
        }
        
        return response;
    }
    
    public ChatMessage sendMessage(String receiverId, String message, String senderEmail) {
        // Find sender - try User table first, then Alumni table
        User sender = null;
        Alumni senderAlumni = null;
        
        Optional<User> senderUserOpt = userRepository.findByEmail(senderEmail);
        if (senderUserOpt.isPresent()) {
            sender = senderUserOpt.get();
        } else {
            // Try Alumni table if not found in User table
            Optional<Alumni> senderAlumniOpt = alumniRepository.findByEmail(senderEmail);
            if (senderAlumniOpt.isPresent() && senderAlumniOpt.get().getStatus() == Alumni.AlumniStatus.APPROVED) {
                senderAlumni = senderAlumniOpt.get();
            } else {
                throw new RuntimeException("Sender not found");
            }
        }
        
        // Find receiver - try User table first, then Alumni table
        User receiver = null;
        Alumni receiverAlumni = null;
        
        Optional<User> receiverUserOpt = userRepository.findById(receiverId);
        if (receiverUserOpt.isPresent()) {
            receiver = receiverUserOpt.get();
        } else {
            // Try Alumni table if not found in User table
            Optional<Alumni> receiverAlumniOpt = alumniRepository.findById(receiverId);
            if (receiverAlumniOpt.isPresent() && receiverAlumniOpt.get().getStatus() == Alumni.AlumniStatus.APPROVED) {
                receiverAlumni = receiverAlumniOpt.get();
            } else {
                throw new RuntimeException("Receiver not found");
            }
        }
        
        ChatMessage chatMessage = new ChatMessage();
        
        // Set sender info
        if (sender != null) {
            chatMessage.setSenderId(sender.getId());
            chatMessage.setSenderName(sender.getName());
            chatMessage.setSenderEmail(sender.getEmail());
        } else if (senderAlumni != null) {
            chatMessage.setSenderId(senderAlumni.getId());
            chatMessage.setSenderName(senderAlumni.getName());
            chatMessage.setSenderEmail(senderAlumni.getEmail());
        } else {
            throw new RuntimeException("Sender information not found");
        }
        
        // Set receiver info
        if (receiver != null) {
            chatMessage.setReceiverId(receiver.getId());
            chatMessage.setReceiverName(receiver.getName());
            chatMessage.setReceiverEmail(receiver.getEmail());
        } else if (receiverAlumni != null) {
            chatMessage.setReceiverId(receiverAlumni.getId());
            chatMessage.setReceiverName(receiverAlumni.getName());
            chatMessage.setReceiverEmail(receiverAlumni.getEmail());
        } else {
            throw new RuntimeException("Receiver information not found");
        }
        
        chatMessage.setMessage(message);
        chatMessage.setType(ChatMessage.MessageType.USER_TO_USER);
        
        ChatMessage saved = chatMessageRepository.save(chatMessage);
        
        // Send email notification
        String receiverEmail = receiver != null ? receiver.getEmail() : 
                              (receiverAlumni != null ? receiverAlumni.getEmail() : null);
        String senderName = sender != null ? sender.getName() : 
                           (senderAlumni != null ? senderAlumni.getName() : null);
        
        if (receiverEmail != null && senderName != null) {
            emailService.sendChatNotification(receiverEmail, senderName, message);
        }
        
        // Log activity for both users
        String receiverName = receiver != null ? receiver.getName() : 
                             (receiverAlumni != null ? receiverAlumni.getName() : null);
        String activityDesc = "Sent message to " + (receiverName != null ? receiverName : "Unknown");
        
        // Determine if receiver is alumni (either from User table with ALUMNI role or from Alumni table)
        boolean isReceiverAlumni = (receiver != null && receiver.getRole() == User.UserRole.ALUMNI) || (receiverAlumni != null);
        
        if (isReceiverAlumni) {
            try {
                String senderIdForActivity = sender != null ? sender.getId() : 
                                           (senderAlumni != null ? senderAlumni.getId() : null);
                if (senderIdForActivity != null) {
                    activityService.logActivityByUserId(senderIdForActivity, "ALUMNI_CHAT", activityDesc);
                    System.out.println("ChatService: Activity logged for alumni chat");
                }
            } catch (Exception e) {
                System.err.println("ChatService: Failed to log alumni chat activity: " + e.getMessage());
            }
        } else if (receiver != null && receiver.getRole() == User.UserRole.PROFESSOR) {
            try {
                String senderIdForActivity = sender != null ? sender.getId() : 
                                           (senderAlumni != null ? senderAlumni.getId() : null);
                if (senderIdForActivity != null) {
                    activityService.logActivityByUserId(senderIdForActivity, "PROFESSOR_CHAT", activityDesc);
                    System.out.println("ChatService: Activity logged for professor chat");
                }
            } catch (Exception e) {
                System.err.println("ChatService: Failed to log professor chat activity: " + e.getMessage());
            }
        }
        
        return saved;
    }
    
    public List<ChatMessage> getChatHistory(String userEmail, String otherUserId) {
        // Find user - try User table first, then Alumni table
        User user = null;
        Alumni alumniUser = null;
        final String userId;
        
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isPresent()) {
            user = userOpt.get();
            userId = user.getId();
        } else {
            // Try Alumni table if not found in User table
            Optional<Alumni> alumniOpt = alumniRepository.findByEmail(userEmail);
            if (alumniOpt.isPresent() && alumniOpt.get().getStatus() == Alumni.AlumniStatus.APPROVED) {
                alumniUser = alumniOpt.get();
                userId = alumniUser.getId();
            } else {
                throw new RuntimeException("User not found");
            }
        }
        
        return chatMessageRepository.findChatMessages(
                userId, 
                otherUserId, 
                PageRequest.of(0, 50, Sort.by("timestamp").descending())
        );
    }
}