package com.stjoseph.assessmentsystem.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.stjoseph.assessmentsystem.model.Connection;

@Repository
public interface ConnectionRepository extends MongoRepository<Connection, String> {
    
    @Query("{ '$or': [{ 'senderId': ?0, 'recipientId': ?1 }, { 'senderId': ?1, 'recipientId': ?0 }] }")
    Optional<Connection> findConnectionBetweenUsers(String userId1, String userId2);
    
    @Query("{ 'recipientId': ?0, 'status': ?1 }")
    List<Connection> findByRecipientIdAndStatus(String recipientId, Connection.ConnectionStatus status);
    
    @Query("{ 'senderId': ?0, 'status': ?1 }")
    List<Connection> findBySenderIdAndStatus(String senderId, Connection.ConnectionStatus status);
    
    @Query("{ '$or': [{ 'senderId': ?0, 'status': 'ACCEPTED' }, { 'recipientId': ?0, 'status': 'ACCEPTED' }] }")
    List<Connection> findAcceptedConnectionsByUserId(String userId);
    
    @Query("{ 'recipientId': ?0, 'status': 'PENDING' }")
    List<Connection> findPendingConnectionRequests(String userId);
    
    @Query("{ '$or': [{ 'senderId': ?0, 'status': ?1 }, { 'recipientId': ?0, 'status': ?1 }] }")
    List<Connection> findConnectionsByUserIdAndStatus(String userId, Connection.ConnectionStatus status);
    
    long countByRecipientIdAndStatus(String recipientId, Connection.ConnectionStatus status);
}
