package com.stjoseph.assessmentsystem.repository;

import com.stjoseph.assessmentsystem.model.Alumni;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlumniRepository extends MongoRepository<Alumni, String> {
    Optional<Alumni> findByEmail(String email);
    List<Alumni> findByStatus(Alumni.AlumniStatus status);
    boolean existsByEmail(String email);
    List<Alumni> findByPhoneNumber(String phoneNumber);
    long countByStatus(Alumni.AlumniStatus status);
}