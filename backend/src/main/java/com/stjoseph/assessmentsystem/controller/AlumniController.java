package com.stjoseph.assessmentsystem.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.dto.AlumniStatsResponse;
import com.stjoseph.assessmentsystem.model.Alumni;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.AlumniRepository;
import com.stjoseph.assessmentsystem.repository.ConnectionRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;
import com.stjoseph.assessmentsystem.service.AlumniEventService;
import com.stjoseph.assessmentsystem.service.AlumniProfileService;
import com.stjoseph.assessmentsystem.service.JobService;

@RestController
@RequestMapping("/alumni")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AlumniController {
    
    @Autowired
    private AlumniEventService alumniEventService;
    
    @Autowired
    private JobService jobService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AlumniRepository alumniRepository;
    
    @Autowired
    private ConnectionRepository connectionRepository;
    
    @Autowired
    private AlumniProfileService alumniProfileService;
    
    @GetMapping("/profile/{userId}")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_PROFESSOR', 'ROLE_ALUMNI', 'ROLE_MANAGEMENT')")
    public ResponseEntity<?> getAlumniProfile(@PathVariable String userId) {
        try {
            // First try to find in Alumni repository
            Optional<Alumni> alumniOpt = alumniRepository.findById(userId);
            if (alumniOpt.isPresent() && alumniOpt.get().getStatus() == Alumni.AlumniStatus.APPROVED) {
                Alumni alumni = alumniOpt.get();
                
                Map<String, Object> profile = new HashMap<>();
                profile.put("id", alumni.getId());
                profile.put("name", alumni.getName());
                profile.put("email", alumni.getEmail());
                profile.put("phone", alumni.getPhoneNumber());
                profile.put("graduationYear", alumni.getGraduationYear());
                profile.put("department", alumni.getDepartment());
                profile.put("currentCompany", alumni.getPlacedCompany());
                profile.put("batch", alumni.getBatch());
                profile.put("joinDate", alumni.getCreatedAt());
                profile.put("lastActive", alumni.getLastLogin());
                
                // Set default values for fields not in Alumni model
                profile.put("currentPosition", "Alumni");
                profile.put("workExperience", "Not specified");
                profile.put("skills", new ArrayList<>());
                profile.put("bio", "No bio available");
                profile.put("location", "Not specified");
                profile.put("linkedinUrl", "");
                profile.put("githubUrl", "");
                profile.put("achievements", new ArrayList<>());
                profile.put("mentorshipAvailable", false);
                
                return ResponseEntity.ok(profile);
            }
            
            // Fallback: check User repository for legacy data
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (!user.getRole().equals(User.UserRole.ALUMNI)) {
                    return ResponseEntity.badRequest().body("User is not an alumni");
                }

                Map<String, Object> profile = new HashMap<>();
                profile.put("id", user.getId());
                profile.put("name", user.getName());
                profile.put("email", user.getEmail());
                profile.put("phone", user.getPhone());
                profile.put("profilePicture", user.getProfilePicture());
                profile.put("graduationYear", user.getGraduationYear());
                profile.put("department", user.getDepartment());
                profile.put("currentCompany", user.getCurrentCompany());
                profile.put("currentPosition", user.getCurrentPosition());
                profile.put("workExperience", user.getWorkExperience());
                profile.put("achievements", user.getAchievements() != null ? user.getAchievements() : new ArrayList<>());
                profile.put("mentorshipAvailable", user.getMentorshipAvailable());
                profile.put("bio", user.getBio());
                profile.put("skills", user.getSkills());
                profile.put("location", user.getLocation());
                profile.put("joinDate", user.getCreatedAt());
                profile.put("lastActive", user.getLastActive());

                return ResponseEntity.ok(profile);
            }
            
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error getting alumni profile: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to get alumni profile: " + e.getMessage());
        }
    }
    
    @GetMapping("/my-profile")
    @PreAuthorize("hasAuthority('ROLE_ALUMNI')")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        try {
            String email = authentication.getName(); // This is the email from JWT
            Map<String, Object> profile = alumniProfileService.getCompleteAlumniProfile(email);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get alumni profile: " + e.getMessage());
        }
    }
    
    @PutMapping("/my-profile")
    @PreAuthorize("hasAuthority('ROLE_ALUMNI')")
    public ResponseEntity<?> updateMyProfile(@RequestBody Map<String, Object> profileData, 
                                           Authentication authentication) {
        try {
            String email = authentication.getName();
            
            // Convert map to AlumniProfile object (only the editable fields)
            com.stjoseph.assessmentsystem.model.AlumniProfile profileUpdate = new com.stjoseph.assessmentsystem.model.AlumniProfile();
            
            if (profileData.containsKey("currentJob")) {
                profileUpdate.setCurrentJob((String) profileData.get("currentJob"));
            }
            if (profileData.containsKey("company")) {
                profileUpdate.setCompany((String) profileData.get("company"));
            }
            if (profileData.containsKey("location")) {
                profileUpdate.setLocation((String) profileData.get("location"));
            }
            if (profileData.containsKey("bio")) {
                profileUpdate.setBio((String) profileData.get("bio"));
            }
            if (profileData.containsKey("skills")) {
                @SuppressWarnings("unchecked")
                java.util.List<String> skills = (java.util.List<String>) profileData.get("skills");
                profileUpdate.setSkills(skills);
            }
            if (profileData.containsKey("linkedinUrl")) {
                profileUpdate.setLinkedinUrl((String) profileData.get("linkedinUrl"));
            }
            if (profileData.containsKey("githubUrl")) {
                profileUpdate.setGithubUrl((String) profileData.get("githubUrl"));
            }
            if (profileData.containsKey("portfolioUrl")) {
                profileUpdate.setPortfolioUrl((String) profileData.get("portfolioUrl"));
            }
            if (profileData.containsKey("experience")) {
                // Convert Integer to String since AlumniProfile expects String
                Object exp = profileData.get("experience");
                profileUpdate.setExperience(exp != null ? exp.toString() : null);
            }
            if (profileData.containsKey("achievements")) {
                @SuppressWarnings("unchecked")
                java.util.List<String> achievements = (java.util.List<String>) profileData.get("achievements");
                profileUpdate.setAchievements(achievements);
            }
            if (profileData.containsKey("isAvailableForMentorship")) {
                profileUpdate.setAvailableForMentorship((Boolean) profileData.get("isAvailableForMentorship"));
            }
            
            alumniProfileService.updateProfileByEmail(email, profileUpdate);
            return ResponseEntity.ok("Profile updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update profile: " + e.getMessage());
        }
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ROLE_ALUMNI')")
    public ResponseEntity<AlumniStatsResponse> getAlumniStats(Authentication authentication) {
        try {
            String alumniId = getUserIdFromAuth(authentication);
            String alumniEmail = getUserEmailFromAuth(authentication);
            
            System.out.println("AlumniController: Getting stats for alumni ID: " + alumniId + ", Email: " + alumniEmail);
            
            // Get real stats from the database
            long jobsPosted = jobService.getJobsByAlumni(alumniEmail).size();
            
            // Get actual network connections count - force fresh calculation
            long networkConnections = 0;
            try {
                // First try to find user in User repository by email
                Optional<User> userOpt = userRepository.findByEmail(alumniEmail);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    // Get fresh connection count directly from database instead of cached field
                    networkConnections = connectionRepository.findAcceptedConnectionsByUserId(user.getId()).size();
                    System.out.println("AlumniController: Found connection count from User table (fresh): " + networkConnections);
                } else {
                    // If not in User table, check Alumni table and try to get connections via ID
                    System.out.println("AlumniController: User not found in User table, checking Alumni table");
                    Optional<Alumni> alumniOpt = alumniRepository.findByEmail(alumniEmail);
                    if (alumniOpt.isPresent()) {
                        Alumni alumni = alumniOpt.get();
                        // Get actual connection count using the alumni ID (fresh from database)
                        try {
                            networkConnections = connectionRepository.findAcceptedConnectionsByUserId(alumni.getId()).size();
                            System.out.println("AlumniController: Found connection count from Alumni ID (fresh): " + networkConnections);
                        } catch (Exception e) {
                            System.err.println("Error getting connection count for alumni: " + e.getMessage());
                            networkConnections = 0;
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Error getting connection count: " + e.getMessage());
                networkConnections = 0;
            }
            
            // Get events count (accepted events)
            long eventsCount = 0;
            try {
                // Count events that this alumni has organized and got approved + management requests they accepted
                long organizedEvents = alumniEventService.getAlumniAcceptedEventsCount(alumniEmail);
                
                // Also count management-to-alumni events they accepted
                // We need to count events where this alumni was the organizer and status is APPROVED
                // This includes both alumni-initiated events and management-requested events they accepted
                eventsCount = organizedEvents;
                
                System.out.println("AlumniController: Found events count: " + eventsCount);
            } catch (Exception e) {
                System.err.println("Error getting events count: " + e.getMessage());
                eventsCount = 0;
            }
            
            System.out.println("AlumniController: Final stats - Connections: " + networkConnections + ", Jobs: " + jobsPosted + ", Events: " + eventsCount);
            
            AlumniStatsResponse stats = new AlumniStatsResponse(networkConnections, eventsCount, jobsPosted);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("AlumniController: Error getting alumni stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/event-request")
    @PreAuthorize("hasAuthority('ROLE_ALUMNI')")
    public ResponseEntity<?> submitEventRequest(@RequestBody Map<String, Object> requestData,
                                               Authentication authentication) {
        try {
            String alumniEmail = getUserEmailFromAuth(authentication);
            Object result = alumniEventService.submitEventRequest(alumniEmail, requestData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/approved-events")
    public ResponseEntity<?> getApprovedEvents() {
        try {
            return ResponseEntity.ok(alumniEventService.getApprovedEvents());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // ================= MANAGEMENT-TO-ALUMNI REQUESTS =================
    
    @GetMapping("/pending-requests")
    @PreAuthorize("hasAuthority('ROLE_ALUMNI')")
    public ResponseEntity<?> getPendingManagementRequests(Authentication authentication) {
        try {
            String alumniId = getUserIdFromAuth(authentication);
            return ResponseEntity.ok(alumniEventService.getPendingManagementRequests(alumniId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/accept-management-request/{requestId}")
    @PreAuthorize("hasAuthority('ROLE_ALUMNI')")
    public ResponseEntity<?> acceptManagementEventRequest(@PathVariable String requestId,
                                                         @RequestBody Map<String, String> response,
                                                         Authentication authentication) {
        try {
            String alumniId = getUserIdFromAuth(authentication);
            String alumniResponse = response.get("response");
            Object result = alumniEventService.acceptManagementEventRequest(requestId, alumniId, alumniResponse);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/reject-management-request/{requestId}")
    @PreAuthorize("hasAuthority('ROLE_ALUMNI')")
    public ResponseEntity<?> rejectManagementEventRequest(@PathVariable String requestId,
                                                         @RequestBody Map<String, String> response,
                                                         Authentication authentication) {
        try {
            String alumniId = getUserIdFromAuth(authentication);
            String rejectionReason = response.get("reason");
            Object result = alumniEventService.rejectManagementEventRequest(requestId, alumniId, rejectionReason);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    private String getUserIdFromAuth(Authentication authentication) {
        return ((com.stjoseph.assessmentsystem.security.UserDetailsImpl) authentication.getPrincipal()).getId();
    }
    
    private String getUserEmailFromAuth(Authentication authentication) {
        return ((com.stjoseph.assessmentsystem.security.UserDetailsImpl) authentication.getPrincipal()).getEmail();
    }
}
