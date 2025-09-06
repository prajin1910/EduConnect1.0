package com.stjoseph.assessmentsystem.repository;

import com.stjoseph.assessmentsystem.model.AssessmentResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentResultRepository extends MongoRepository<AssessmentResult, String> {
    List<AssessmentResult> findByStudentId(String studentId);
    List<AssessmentResult> findByAssessmentId(String assessmentId);
    Optional<AssessmentResult> findByAssessmentIdAndStudentId(String assessmentId, String studentId);
    
    long countByStudentId(String studentId);
}