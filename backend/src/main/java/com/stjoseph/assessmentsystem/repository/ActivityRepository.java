package com.stjoseph.assessmentsystem.repository;

import com.stjoseph.assessmentsystem.model.Activity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ActivityRepository extends MongoRepository<Activity, String> {
    List<Activity> findByUserId(String userId);
    List<Activity> findByUserIdAndDate(String userId, LocalDate date);
    
    @Query("{ 'userId': ?0, 'date': { $gte: ?1, $lte: ?2 } }")
    List<Activity> findByUserIdAndDateBetween(String userId, LocalDate startDate, LocalDate endDate);
    
    long countByUserIdAndDate(String userId, LocalDate date);
}