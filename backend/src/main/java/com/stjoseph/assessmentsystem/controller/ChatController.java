package com.stjoseph.assessmentsystem.controller;

import com.stjoseph.assessmentsystem.dto.ChatRequest;
import com.stjoseph.assessmentsystem.model.ChatMessage;
import com.stjoseph.assessmentsystem.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {
    
    @Autowired
    private ChatService chatService;
    
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(Authentication auth) {
        try {
            List<Map<String, Object>> conversations = chatService.getConversations(auth.getName());
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(Authentication auth) {
        try {
            List<Map<String, Object>> users = chatService.getAllChatUsers(auth.getName());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/mark-read/{userId}")
    public ResponseEntity<?> markMessagesAsRead(@PathVariable String userId, Authentication auth) {
        try {
            chatService.markMessagesAsRead(auth.getName(), userId);
            return ResponseEntity.ok("Messages marked as read");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/ai")
    public ResponseEntity<?> chatWithAI(@RequestBody ChatRequest request, Authentication auth) {
        try {
            String response = chatService.chatWithAI(request, auth.getName());
            return ResponseEntity.ok(Map.of("response", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> request, Authentication auth) {
        try {
            String receiverId = request.get("receiverId");
            String messageText = request.get("message");
            
            if (receiverId == null || receiverId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Receiver ID is required");
            }
            if (messageText == null || messageText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Message text is required");
            }
            
            ChatMessage message = chatService.sendMessage(receiverId, messageText, auth.getName());
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getChatHistory(@PathVariable String userId, Authentication auth) {
        try {
            List<ChatMessage> messages = chatService.getChatHistory(auth.getName(), userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}