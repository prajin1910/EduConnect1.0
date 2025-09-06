package com.stjoseph.assessmentsystem.controller;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.model.Connection;
import com.stjoseph.assessmentsystem.service.ConnectionService;

@RestController
@RequestMapping("/connections")
@CrossOrigin(origins = "*")
public class ConnectionController {
    
    @Autowired
    private ConnectionService connectionService;
    
    @PostMapping("/send-request")
    public ResponseEntity<?> sendConnectionRequest(@RequestBody Map<String, String> request, 
                                                  Authentication authentication) {
        try {
            String senderId = getUserIdFromAuth(authentication);
            String recipientId = request.get("recipientId");
            String message = request.get("message");
            
            System.out.println("ConnectionController: Sending connection request");
            System.out.println("Sender ID: " + senderId);
            System.out.println("Recipient ID: " + recipientId);
            System.out.println("Message: " + message);
            
            // Validate that recipient exists
            if (!connectionService.userExists(recipientId)) {
                System.err.println("ConnectionController: Recipient not found or not approved: " + recipientId);
                return ResponseEntity.badRequest().body(Map.of("error", "Recipient not found or not approved"));
            }
            
            Connection connection = connectionService.sendConnectionRequest(senderId, recipientId, message);
            System.out.println("ConnectionController: Connection request sent successfully");
            
            return ResponseEntity.ok(Map.of(
                "message", "Connection request sent successfully",
                "connectionId", connection.getId()
            ));
        } catch (Exception e) {
            System.err.println("ConnectionController: Error sending connection request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{connectionId}/accept")
    public ResponseEntity<?> acceptConnectionRequest(@PathVariable String connectionId,
                                                   Authentication authentication) {
        try {
            String userId = getUserIdFromAuth(authentication);
            Connection connection = connectionService.acceptConnectionRequest(connectionId, userId);
            return ResponseEntity.ok(Map.of(
                "message", "Connection request accepted",
                "connection", connection
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{connectionId}/reject")
    public ResponseEntity<?> rejectConnectionRequest(@PathVariable String connectionId,
                                                   Authentication authentication) {
        try {
            String userId = getUserIdFromAuth(authentication);
            Connection connection = connectionService.rejectConnectionRequest(connectionId, userId);
            return ResponseEntity.ok(Map.of(
                "message", "Connection request rejected",
                "connection", connection
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests(Authentication authentication) {
        try {
            String userId = getUserIdFromAuth(authentication);
            System.out.println("ConnectionController: Getting pending requests for user: " + userId);
            List<Connection> pending = connectionService.getPendingConnectionRequests(userId);
            System.out.println("ConnectionController: Found " + pending.size() + " pending requests");
            
            // Transform connections to include sender/recipient details
            List<Map<String, Object>> enrichedConnections = new java.util.ArrayList<>();
            for (Connection connection : pending) {
                Map<String, Object> connectionData = new HashMap<>();
                connectionData.put("id", connection.getId());
                connectionData.put("senderId", connection.getSenderId());
                connectionData.put("recipientId", connection.getRecipientId());
                connectionData.put("message", connection.getMessage());
                connectionData.put("status", connection.getStatus().toString());
                connectionData.put("requestedAt", connection.getRequestedAt().toString());
                
                // Get sender details
                ConnectionService.UserDetails senderDetails = connectionService.getUserDetails(connection.getSenderId());
                if (senderDetails != null) {
                    connectionData.put("senderName", senderDetails.getName());
                    connectionData.put("senderEmail", senderDetails.getEmail());
                    connectionData.put("senderRole", senderDetails.getRole());
                }
                
                enrichedConnections.add(connectionData);
            }
            
            return ResponseEntity.ok(enrichedConnections);
        } catch (Exception e) {
            System.err.println("ConnectionController: Error getting pending requests: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/accepted")
    public ResponseEntity<?> getAcceptedConnections(Authentication authentication) {
        try {
            String userId = getUserIdFromAuth(authentication);
            List<Connection> connections = connectionService.getAcceptedConnections(userId);
            return ResponseEntity.ok(connections);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/status/{otherUserId}")
    public ResponseEntity<?> getConnectionStatus(@PathVariable String otherUserId,
                                                Authentication authentication) {
        try {
            String userId = getUserIdFromAuth(authentication);
            System.out.println("ConnectionController: Checking connection status between " + userId + " and " + otherUserId);
            
            // Validate that the other user exists
            if (!connectionService.userExists(otherUserId)) {
                System.err.println("ConnectionController: Other user not found: " + otherUserId);
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            
            String status = connectionService.getConnectionStatus(userId, otherUserId);
            System.out.println("ConnectionController: Connection status: " + status);
            return ResponseEntity.ok(Map.of("status", status));
        } catch (Exception e) {
            System.err.println("ConnectionController: Error getting connection status: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<?> getConnectionCount(Authentication authentication) {
        try {
            String userId = getUserIdFromAuth(authentication);
            long count = connectionService.getConnectionCount(userId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    private String getUserIdFromAuth(Authentication authentication) {
        return ((com.stjoseph.assessmentsystem.security.UserDetailsImpl) authentication.getPrincipal()).getId();
    }
}
