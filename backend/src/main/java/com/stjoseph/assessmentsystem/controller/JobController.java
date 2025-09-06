package com.stjoseph.assessmentsystem.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.model.Job;
import com.stjoseph.assessmentsystem.service.JobService;

@RestController
@RequestMapping("/jobs")
@CrossOrigin(origins = "*")
public class JobController {
    
    @Autowired
    private JobService jobService;
    
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        try {
            List<Job> jobs = jobService.getAllActiveJobs();
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Job>> searchJobs(@RequestParam String query) {
        try {
            List<Job> jobs = jobService.searchJobs(query);
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable String id) {
        try {
            Job job = jobService.getJobById(id);
            return ResponseEntity.ok(job);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/my-jobs")
    public ResponseEntity<List<Job>> getMyJobs(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<Job> jobs = jobService.getJobsByAlumni(userEmail);
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody Job job, Authentication authentication) {
        try {
            System.out.println("JobController: Received job post request from: " + authentication.getName());
            System.out.println("JobController: Job title: " + job.getTitle());
            
            String userEmail = authentication.getName();
            Job createdJob = jobService.createJob(job, userEmail);
            
            System.out.println("JobController: Job created successfully with ID: " + createdJob.getId());
            return ResponseEntity.ok(createdJob);
        } catch (Exception e) {
            System.err.println("JobController: Error creating job: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to create job",
                "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable String id, @RequestBody Job job, Authentication authentication) {
        try {
            System.out.println("JobController: Received job update request for ID: " + id + " from: " + authentication.getName());
            System.out.println("JobController: Updated job title: " + job.getTitle());
            
            String userEmail = authentication.getName();
            Job updatedJob = jobService.updateJob(id, job, userEmail);
            
            System.out.println("JobController: Job updated successfully with ID: " + updatedJob.getId());
            return ResponseEntity.ok(updatedJob);
        } catch (Exception e) {
            System.err.println("JobController: Error updating job: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to update job",
                "message", e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable String id, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            jobService.deleteJob(id, userEmail);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
