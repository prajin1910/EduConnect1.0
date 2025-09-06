package com.stjoseph.assessmentsystem.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stjoseph.assessmentsystem.model.Alumni;
import com.stjoseph.assessmentsystem.model.Job;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.AlumniRepository;
import com.stjoseph.assessmentsystem.repository.JobRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;

@Service
public class JobService {
    
    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AlumniRepository alumniRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    public List<Job> getAllActiveJobs() {
        return jobRepository.findByStatusOrderByPostedAtDesc(Job.JobStatus.ACTIVE);
    }
    
    public List<Job> getJobsByAlumni(String userEmail) {
        // Find user by email to get their ID
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        String userId = null;
        
        if (userOpt.isPresent()) {
            userId = userOpt.get().getId();
        } else {
            // Try to find in Alumni repository
            Optional<Alumni> alumniOpt = alumniRepository.findByEmail(userEmail);
            if (alumniOpt.isPresent()) {
                userId = alumniOpt.get().getId();
            } else {
                throw new RuntimeException("User not found");
            }
        }
        
        return jobRepository.findByPostedByOrderByPostedAtDesc(userId);
    }
    
    public Job createJob(Job job, String alumniEmail) {
        try {
            System.out.println("JobService: Creating job for alumni email: " + alumniEmail);
            
            // First try to find in User repository
            Optional<User> userOpt = userRepository.findByEmail(alumniEmail);
            User user = null;
            
            if (userOpt.isPresent()) {
                user = userOpt.get();
                System.out.println("JobService: Found user in User repository: " + user.getName() + ", Role: " + user.getRole());
                
                if (user.getRole() != User.UserRole.ALUMNI) {
                    System.err.println("JobService: User is not alumni, role: " + user.getRole());
                    throw new RuntimeException("Only alumni can post jobs");
                }
            } else {
                // Try to find in Alumni repository
                System.out.println("JobService: User not found in User repository, checking Alumni repository");
                Optional<Alumni> alumniOpt = alumniRepository.findByEmail(alumniEmail);
                
                if (alumniOpt.isPresent()) {
                    Alumni alumni = alumniOpt.get();
                    System.out.println("JobService: Found alumni in Alumni repository: " + alumni.getName() + ", Status: " + alumni.getStatus());
                    
                    if (alumni.getStatus() != Alumni.AlumniStatus.APPROVED) {
                        System.err.println("JobService: Alumni is not approved, status: " + alumni.getStatus());
                        throw new RuntimeException("Only approved alumni can post jobs");
                    }
                    
                    // Create a temporary User object for consistency
                    user = new User();
                    user.setId(alumni.getId());
                    user.setName(alumni.getName());
                    user.setEmail(alumni.getEmail());
                    user.setRole(User.UserRole.ALUMNI);
                } else {
                    System.err.println("JobService: User not found in either User or Alumni repository with email: " + alumniEmail);
                    throw new RuntimeException("User not found");
                }
            }
            
            // Set posting details
            job.setPostedBy(user.getId());
            job.setPostedByName(user.getName());
            job.setPostedByEmail(user.getEmail());
            job.setStatus(Job.JobStatus.ACTIVE);
            
            System.out.println("JobService: Saving job: " + job.getTitle());
            Job savedJob = jobRepository.save(job);
            System.out.println("JobService: Job saved with ID: " + savedJob.getId());
            
            // Send notification to followers
            try {
                notificationService.createJobPostNotification(user.getId(), user.getName(), job.getTitle());
            } catch (Exception e) {
                System.err.println("Failed to send job post notification: " + e.getMessage());
            }
            
            return savedJob;
        } catch (Exception e) {
            System.err.println("JobService: Error creating job: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create job: " + e.getMessage());
        }
    }
    
    public Job updateJob(String jobId, Job updatedJob, String userEmail) {
        System.out.println("JobService: Updating job with ID: " + jobId + " for user: " + userEmail);
        
        Job existingJob = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        System.out.println("JobService: Found existing job: " + existingJob.getTitle());
        System.out.println("JobService: Existing job posted by: " + existingJob.getPostedByEmail());

        // First check if user exists in User repository
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        Alumni alumni = null;
        
        if (!userOpt.isPresent()) {
            System.out.println("JobService: User not found in User repository, checking Alumni repository");
            // Check Alumni repository
            Optional<Alumni> alumniOpt = alumniRepository.findByEmail(userEmail);
            if (!alumniOpt.isPresent()) {
                System.out.println("JobService: Alumni not found");
                throw new RuntimeException("User not found");
            }
            alumni = alumniOpt.get();
            System.out.println("JobService: Found alumni: " + alumni.getName());
        } else {
            System.out.println("JobService: Found user: " + userOpt.get().getName());
        }

        // Verify ownership
        if (!existingJob.getPostedByEmail().equals(userEmail)) {
            System.out.println("JobService: User " + userEmail + " is not authorized to update job posted by " + existingJob.getPostedByEmail());
            throw new RuntimeException("You can only edit jobs posted by you");
        }

        // Update job fields
        existingJob.setTitle(updatedJob.getTitle());
        existingJob.setCompany(updatedJob.getCompany());
        existingJob.setLocation(updatedJob.getLocation());
        existingJob.setType(updatedJob.getType());
        existingJob.setSalary(updatedJob.getSalary());
        existingJob.setDescription(updatedJob.getDescription());
        existingJob.setRequirements(updatedJob.getRequirements());
        existingJob.setApplicationUrl(updatedJob.getApplicationUrl());
        existingJob.setContactEmail(updatedJob.getContactEmail());

        System.out.println("JobService: Saving updated job");
        Job savedJob = jobRepository.save(existingJob);
        System.out.println("JobService: Job updated successfully with ID: " + savedJob.getId());
        return savedJob;
    }    public void deleteJob(String jobId, String userEmail) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        // Find user by email - check both User and Alumni repositories
        String userId = null;
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        
        if (userOpt.isPresent()) {
            userId = userOpt.get().getId();
        } else {
            // Try to find in Alumni repository
            Optional<Alumni> alumniOpt = alumniRepository.findByEmail(userEmail);
            if (alumniOpt.isPresent()) {
                userId = alumniOpt.get().getId();
            } else {
                throw new RuntimeException("User not found");
            }
        }
        
        // Only the poster (alumni) can delete
        if (!job.getPostedBy().equals(userId)) {
            throw new RuntimeException("You can only delete jobs that you posted");
        }
        
        jobRepository.deleteById(jobId);
    }
    
    public List<Job> searchJobs(String query) {
        // Simple search across title, company, and location
        List<Job> results = jobRepository.findByTitleContainingIgnoreCaseAndStatusOrderByPostedAtDesc(query, Job.JobStatus.ACTIVE);
        results.addAll(jobRepository.findByCompanyContainingIgnoreCaseAndStatusOrderByPostedAtDesc(query, Job.JobStatus.ACTIVE));
        results.addAll(jobRepository.findByLocationContainingIgnoreCaseAndStatusOrderByPostedAtDesc(query, Job.JobStatus.ACTIVE));
        
        // Remove duplicates
        return results.stream().distinct().toList();
    }
    
    public Job getJobById(String jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }
}
