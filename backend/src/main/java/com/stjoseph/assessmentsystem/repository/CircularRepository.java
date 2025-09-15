package com.stjoseph.assessmentsystem.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.stjoseph.assessmentsystem.model.Circular;

@Repository
public interface CircularRepository extends MongoRepository<Circular, String> {
    
    // Find circulars sent by a specific user
    List<Circular> findBySenderIdOrderByCreatedAtDesc(String senderId);
    
    // Find circulars for a specific recipient
    List<Circular> findByRecipientsContainingOrderByCreatedAtDesc(String recipientId);
    
    // Find active circulars for a specific recipient
    @Query("{ 'recipients': ?0, 'status': 'ACTIVE' }")
    List<Circular> findActiveCircularsByRecipient(String recipientId);
    
    // Find all active circulars
    List<Circular> findByStatusOrderByCreatedAtDesc(Circular.CircularStatus status);
    
    // Find circulars by sender role
    List<Circular> findBySenderRoleOrderByCreatedAtDesc(Circular.SenderRole senderRole);
    
    // Find unread circulars for a user
    @Query("{ 'recipients': ?0, 'status': 'ACTIVE', 'readBy': { $ne: ?0 } }")
    List<Circular> findUnreadCircularsByRecipient(String recipientId);
    
    // Count unread circulars for a user
    @Query(value = "{ 'recipients': ?0, 'status': 'ACTIVE', 'readBy': { $ne: ?0 } }", count = true)
    long countUnreadCircularsByRecipient(String recipientId);
}
