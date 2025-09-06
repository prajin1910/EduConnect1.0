package com.stjoseph.assessmentsystem.repository;

import com.stjoseph.assessmentsystem.model.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    @Query("{ $or: [ { 'senderId': ?0, 'receiverId': ?1 }, { 'senderId': ?1, 'receiverId': ?0 } ] }")
    List<ChatMessage> findChatMessages(String userId1, String userId2, Pageable pageable);
    
    List<ChatMessage> findBySenderIdAndType(String senderId, ChatMessage.MessageType type);
    List<ChatMessage> findByReceiverIdAndReadFalse(String receiverId);
    
    long countByReceiverIdAndReadFalse(String receiverId);
    
    @Query("{ $or: [ { 'senderId': ?0 }, { 'receiverId': ?0 } ] }")
    List<ChatMessage> findByUserInvolved(String userId);
}