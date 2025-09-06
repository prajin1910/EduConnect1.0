package com.stjoseph.assessmentsystem.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.stjoseph.assessmentsystem.model.Job;

@Repository
public interface JobRepository extends MongoRepository<Job, String> {
    List<Job> findByStatusOrderByPostedAtDesc(Job.JobStatus status);
    List<Job> findByPostedByOrderByPostedAtDesc(String postedBy);
    List<Job> findByCompanyContainingIgnoreCaseAndStatusOrderByPostedAtDesc(String company, Job.JobStatus status);
    List<Job> findByTitleContainingIgnoreCaseAndStatusOrderByPostedAtDesc(String title, Job.JobStatus status);
    List<Job> findByLocationContainingIgnoreCaseAndStatusOrderByPostedAtDesc(String location, Job.JobStatus status);
}
