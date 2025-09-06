package com.stjoseph.assessmentsystem.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.stjoseph.assessmentsystem.model.User;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(User.UserRole role);
    boolean existsByEmail(String email);
    
    @Query("{ 'email': { $regex: ?0, $options: 'i' } }")
    List<User> findByEmailContainingIgnoreCase(String email);
    
    @Query("{ 'email': { $regex: '^?0', $options: 'i' } }")
    List<User> findByEmailStartingWithIgnoreCase(String emailPrefix);
    
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<User> findByNameContainingIgnoreCase(String name);
    
    @Query("{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'email': { $regex: ?0, $options: 'i' } }, { 'phoneNumber': { $regex: ?0, $options: 'i' } } ] }")
    List<User> findByNameOrEmailOrPhoneContainingIgnoreCase(String query);
    
    @Query("{ 'phoneNumber': ?0 }")
    List<User> findByPhoneNumber(String phoneNumber);
    
    long countByRole(User.UserRole role);
    
    @Query("{ 'role': ?0, 'verified': ?1 }")
    List<User> findByRoleAndApproved(User.UserRole role, boolean approved);
    
    // Simplified attendance queries using native Spring Data methods
    List<User> findByRoleAndDepartment(User.UserRole role, String department);
    List<User> findByRoleAndDepartmentAndClassName(User.UserRole role, String department, String className);
    List<User> findByRoleAndDepartmentAndVerified(User.UserRole role, String department, boolean verified);
    List<User> findByRoleAndDepartmentAndClassNameAndVerified(User.UserRole role, String department, String className, boolean verified);
    
    // Find students by department (for management)
    @Query("{ 'role': 'STUDENT', 'department': ?0, 'verified': true }")
    List<User> findStudentsByDepartment(String department);
}