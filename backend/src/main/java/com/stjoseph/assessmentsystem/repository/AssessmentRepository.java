package com.stjoseph.assessmentsystem.repository;

import com.stjoseph.assessmentsystem.model.Assessment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AssessmentRepository extends MongoRepository<Assessment, String> {
    List<Assessment> findByCreatedBy(String createdBy);
    List<Assessment> findByAssignedToContaining(String studentId);
    
    @Query("{ 'assignedTo': { $in: [?0] }, 'startTime': { $lte: ?1 }, 'endTime': { $gte: ?1 } }")
    List<Assessment> findActiveAssessmentsForStudent(String studentId, LocalDateTime now);
    
    @Query("{ 'assignedTo': { $in: [?0] }, 'endTime': { $lt: ?1 } }")
    List<Assessment> findCompletedAssessmentsForStudent(String studentId, LocalDateTime now);
    
    List<Assessment> findByType(Assessment.AssessmentType type);
    
    long countByCreatedBy(String createdBy);
    
    // Add method to count total assessments
    @Override
    long count();
}