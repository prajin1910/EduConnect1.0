package com.stjoseph.assessmentsystem.repository;

import com.stjoseph.assessmentsystem.model.OTPVerification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OTPVerificationRepository extends MongoRepository<OTPVerification, String> {
    Optional<OTPVerification> findByEmail(String email);
    void deleteByEmail(String email);
}