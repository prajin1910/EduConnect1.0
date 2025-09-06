package com.stjoseph.assessmentsystem.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.stjoseph.assessmentsystem.model.Notification;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    
    @Query("{ 'recipients': ?0 }")
    List<Notification> findByRecipientsContaining(String userId);
    
    @Query("{ 'recipients': ?0, 'readBy': { $nin: [?0] } }")
    List<Notification> findUnreadByUser(String userId);
    
    @Query("{ 'eventId': ?0 }")
    List<Notification> findByEventId(String eventId);
    
    List<Notification> findByTypeOrderByCreatedAtDesc(Notification.NotificationType type);
}
