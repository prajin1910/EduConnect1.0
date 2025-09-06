package com.stjoseph.assessmentsystem.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.stjoseph.assessmentsystem.model.Resume;

@Repository
public interface ResumeRepository extends MongoRepository<Resume, String> {
    
    List<Resume> findByUserIdAndIsActiveTrue(String userId);
    
    Optional<Resume> findByUserIdAndIsActiveTrueOrderByUploadedAtDesc(String userId);
    
    // Find active resume for a user
    Optional<Resume> findByUserIdAndIsActive(String userId, boolean isActive);
    
    List<Resume> findByUserId(String userId);
    
    void deleteByUserId(String userId);
    
    List<Resume> findBySkillsContainingIgnoreCase(String skill);
    
    List<Resume> findByContactInfoLinkedinIsNotNull();
    
    List<Resume> findByContactInfoGithubIsNotNull();
    
    // Find resumes with ATS analysis
    @Query("{ 'atsAnalysis': { $exists: true, $ne: null } }")
    List<Resume> findResumesWithATSAnalysis();
    
    // Find resumes sent to management
    @Query("{ 'atsAnalysis.sentToManagement': true }")
    List<Resume> findResumesSentToManagement();
    
    // Find resumes by user with ATS analysis
    @Query("{ 'userId': ?0, 'atsAnalysis': { $exists: true, $ne: null } }")
    List<Resume> findByUserIdWithATSAnalysis(String userId);
    
    // Count resumes for a user
    long countByUserId(String userId);
    
    // Find resumes by file type
    List<Resume> findByFileType(String fileType);
}
