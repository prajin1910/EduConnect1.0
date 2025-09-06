package com.stjoseph.assessmentsystem.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.stjoseph.assessmentsystem.model.AlumniProfile;

@Repository
public interface AlumniProfileRepository extends MongoRepository<AlumniProfile, String> {
    Optional<AlumniProfile> findByUserId(String userId);
    boolean existsByUserId(String userId);
}
