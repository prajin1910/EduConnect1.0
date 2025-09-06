package com.stjoseph.assessmentsystem.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stjoseph.assessmentsystem.model.Alumni;
import com.stjoseph.assessmentsystem.model.AlumniProfile;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.AlumniProfileRepository;
import com.stjoseph.assessmentsystem.repository.AlumniRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;

@Service
public class AlumniProfileService {
    
    @Autowired
    private AlumniProfileRepository alumniProfileRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AlumniRepository alumniRepository;
    
    public AlumniProfile getOrCreateProfile(String userId) {
        Optional<AlumniProfile> existingProfile = alumniProfileRepository.findByUserId(userId);
        if (existingProfile.isPresent()) {
            return existingProfile.get();
        }
        
        // Create new profile
        AlumniProfile profile = new AlumniProfile(userId);
        return alumniProfileRepository.save(profile);
    }
    
    public AlumniProfile updateProfile(String userId, AlumniProfile profileData) {
        AlumniProfile profile = getOrCreateProfile(userId);
        
        // Update fields
        if (profileData.getCurrentJob() != null) {
            profile.setCurrentJob(profileData.getCurrentJob());
        }
        if (profileData.getCompany() != null) {
            profile.setCompany(profileData.getCompany());
        }
        if (profileData.getLocation() != null) {
            profile.setLocation(profileData.getLocation());
        }
        if (profileData.getBio() != null) {
            profile.setBio(profileData.getBio());
        }
        if (profileData.getSkills() != null) {
            profile.setSkills(profileData.getSkills());
        }
        if (profileData.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(profileData.getLinkedinUrl());
        }
        if (profileData.getGithubUrl() != null) {
            profile.setGithubUrl(profileData.getGithubUrl());
        }
        if (profileData.getPortfolioUrl() != null) {
            profile.setPortfolioUrl(profileData.getPortfolioUrl());
        }
        if (profileData.getExperience() != null) {
            profile.setExperience(profileData.getExperience());
        }
        if (profileData.getAchievements() != null) {
            profile.setAchievements(profileData.getAchievements());
        }
        
        profile.setAvailableForMentorship(profileData.isAvailableForMentorship());
        profile.setUpdatedAt(LocalDateTime.now());
        
        return alumniProfileRepository.save(profile);
    }
    
    public AlumniProfile updateProfileByEmail(String userEmail, AlumniProfile profileData) {
        // Find alumni by email to get their ID
        Optional<Alumni> alumniOpt = alumniRepository.findByEmail(userEmail);
        if (alumniOpt.isEmpty()) {
            throw new RuntimeException("Alumni not found");
        }
        
        Alumni alumni = alumniOpt.get();
        return updateProfile(alumni.getId(), profileData);
    }
    
    public Map<String, Object> getCompleteAlumniProfile(String userEmail) {
        // Find alumni by email
        Optional<Alumni> alumniOpt = alumniRepository.findByEmail(userEmail);
        if (alumniOpt.isEmpty()) {
            throw new RuntimeException("Alumni not found");
        }
        
        Alumni alumni = alumniOpt.get();
        AlumniProfile profile = getOrCreateProfile(alumni.getId());
        
        return buildCompleteProfileMap(alumni, profile);
    }
    
    public Map<String, Object> getCompleteAlumniProfileById(String alumniId) {
        // Find alumni by ID
        Optional<Alumni> alumniOpt = alumniRepository.findById(alumniId);
        if (alumniOpt.isEmpty()) {
            throw new RuntimeException("Alumni not found");
        }
        
        Alumni alumni = alumniOpt.get();
        AlumniProfile profile = getOrCreateProfile(alumni.getId());
        
        return buildCompleteProfileMap(alumni, profile);
    }
    
    private Map<String, Object> buildCompleteProfileMap(Alumni alumni, AlumniProfile profile) {
        Map<String, Object> completeProfile = new HashMap<>();
        // Basic alumni registration data (pre-filled, non-editable)
        completeProfile.put("id", alumni.getId());
        completeProfile.put("name", alumni.getName());
        completeProfile.put("email", alumni.getEmail());
        completeProfile.put("phoneNumber", alumni.getPhoneNumber());
        completeProfile.put("department", alumni.getDepartment());
        completeProfile.put("graduationYear", alumni.getGraduationYear());
        completeProfile.put("batch", alumni.getBatch());
        completeProfile.put("placedCompany", alumni.getPlacedCompany());
        completeProfile.put("role", "ALUMNI");
        completeProfile.put("verified", alumni.getStatus() == Alumni.AlumniStatus.APPROVED);
        
        // Additional profile data (editable by alumni)
        completeProfile.put("currentJob", profile.getCurrentJob());
        completeProfile.put("company", profile.getCompany());
        completeProfile.put("location", profile.getLocation());
        completeProfile.put("bio", profile.getBio());
        completeProfile.put("skills", profile.getSkills());
        completeProfile.put("linkedinUrl", profile.getLinkedinUrl());
        completeProfile.put("githubUrl", profile.getGithubUrl());
        completeProfile.put("portfolioUrl", profile.getPortfolioUrl());
        completeProfile.put("isAvailableForMentorship", profile.isAvailableForMentorship());
        completeProfile.put("experience", profile.getExperience());
        completeProfile.put("achievements", profile.getAchievements());
        completeProfile.put("profilePicture", profile.getProfilePicture());
        completeProfile.put("updatedAt", profile.getUpdatedAt());
        
        return completeProfile;
    }
    
    public List<Map<String, Object>> getAllVerifiedAlumniWithProfiles() {
        List<User> verifiedAlumni = userRepository.findByRoleAndApproved(User.UserRole.ALUMNI, true);
        
        return verifiedAlumni.stream().map(user -> {
            AlumniProfile profile = getOrCreateProfile(user.getId());
            
            Map<String, Object> alumniData = new HashMap<>();
            alumniData.put("id", user.getId());
            alumniData.put("name", user.getName());
            alumniData.put("email", user.getEmail());
            alumniData.put("department", user.getDepartment());
            alumniData.put("graduationYear", extractGraduationYear(user.getEmail()));
            
            // Add profile data
            alumniData.put("currentJob", profile.getCurrentJob());
            alumniData.put("company", profile.getCompany());
            alumniData.put("location", profile.getLocation());
            alumniData.put("bio", profile.getBio());
            alumniData.put("skills", profile.getSkills());
            alumniData.put("linkedinUrl", profile.getLinkedinUrl());
            alumniData.put("githubUrl", profile.getGithubUrl());
            alumniData.put("portfolioUrl", profile.getPortfolioUrl());
            alumniData.put("isAvailableForMentorship", profile.isAvailableForMentorship());
            alumniData.put("experience", profile.getExperience());
            alumniData.put("profilePicture", profile.getProfilePicture());
            
            return alumniData;
        }).collect(Collectors.toList());
    }
    
    private String extractGraduationYear(String email) {
        // Extract year from email like "23cs1246@stjosephstechnology.ac.in"
        if (email != null && email.matches("^\\d{2}.*")) {
            String yearPrefix = email.substring(0, 2);
            int year = Integer.parseInt(yearPrefix);
            // Assuming 23 means 2023, 24 means 2024, etc.
            int graduationYear = (year <= 30) ? 2000 + year : 1900 + year;
            return String.valueOf(graduationYear + 4); // Adding 4 years for graduation
        }
        return "Unknown";
    }
}
