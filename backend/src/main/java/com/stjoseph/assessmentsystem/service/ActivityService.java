package com.stjoseph.assessmentsystem.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stjoseph.assessmentsystem.model.Activity;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.ActivityRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;

@Service
public class ActivityService {
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public void logActivity(String userEmail, String type, String description) {
        try {
            // Find user by email to get user ID
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
            
            Activity activity = new Activity();
            activity.setUserId(user.getId());
            
            try {
                activity.setType(Activity.ActivityType.valueOf(type.toUpperCase()));
            } catch (IllegalArgumentException e) {
                // If the activity type is not found, log it but don't fail
                System.err.println("Unknown activity type: " + type + ". Available types: " + 
                    java.util.Arrays.toString(Activity.ActivityType.values()));
                return;
            }
            
            activity.setDescription(description);
            
            activityRepository.save(activity);
            System.out.println("Activity logged successfully: " + type + " for user: " + userEmail);
        } catch (Exception e) {
            System.err.println("Error logging activity for user " + userEmail + ": " + e.getMessage());
            // Don't throw exception to avoid affecting main functionality
        }
    }
    
    public void logActivityByUserId(String userId, String type, String description) {
        try {
            System.out.println("ActivityService: Logging activity for user ID: " + userId + ", type: " + type + ", description: " + description);
            
            Activity activity = new Activity();
            activity.setUserId(userId);
            
            try {
                activity.setType(Activity.ActivityType.valueOf(type.toUpperCase()));
            } catch (IllegalArgumentException e) {
                System.err.println("Unknown activity type: " + type + ". Available types: " + 
                    java.util.Arrays.toString(Activity.ActivityType.values()));
                return;
            }
            
            activity.setDescription(description);
            
            Activity savedActivity = activityRepository.save(activity);
            System.out.println("Activity logged successfully: " + type + " for user ID: " + userId);
            System.out.println("Saved activity ID: " + savedActivity.getId() + ", Date: " + savedActivity.getDate());
            
            // Update AI assessment count if this is an AI assessment activity
            if (type.equals("AI_ASSESSMENT") && description.contains("Completed AI assessment")) {
                try {
                    Optional<User> userOpt = userRepository.findById(userId);
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        if (user.getRole() == User.UserRole.STUDENT) {
                            Integer currentCount = user.getAiAssessmentCount();
                            Integer newCount = (currentCount != null) ? (currentCount + 1) : 1;
                            user.setAiAssessmentCount(newCount);
                            userRepository.save(user);
                            System.out.println("ActivityService: Incremented AI assessment count for student: " + user.getName() + " to " + newCount);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error updating AI assessment count: " + e.getMessage());
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error logging activity for user ID " + userId + ": " + e.getMessage());
            // Log error details without printing full stack trace
        }
    }
    
    public List<Activity> getUserActivities(String userId, String startDate, String endDate) {
        System.out.println("ActivityService: Getting activities for user ID: " + userId);
        
        List<Activity> activities;
        if (startDate != null && endDate != null) {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            activities = activityRepository.findByUserIdAndDateBetween(userId, start, end);
        } else {
            activities = activityRepository.findByUserId(userId);
        }
        
        System.out.println("ActivityService: Found " + activities.size() + " activities for user: " + userId);
        
        // Debug: Print first few activities
        if (!activities.isEmpty()) {
            System.out.println("ActivityService: Sample activities:");
            activities.stream().limit(3).forEach(activity -> {
                System.out.println("  - " + activity.getType() + " on " + activity.getDate() + ": " + activity.getDescription());
            });
        }
        
        return activities;
    }
    
    public Map<String, Object> getHeatmapData(String userId) {
        System.out.println("ActivityService: Getting heatmap data for user ID: " + userId);
        List<Activity> activities = activityRepository.findByUserId(userId);
        System.out.println("ActivityService: Found " + activities.size() + " activities for heatmap");
        
        // Debug: Print activity details
        if (!activities.isEmpty()) {
            System.out.println("ActivityService: Activity breakdown:");
            activities.forEach(activity -> {
                System.out.println("  - ID: " + activity.getId() + ", Type: " + activity.getType() + 
                                 ", Date: " + activity.getDate() + ", Description: " + activity.getDescription());
            });
        }
        
        Map<String, Map<String, Integer>> heatmapData = new HashMap<>();
        
        activities.forEach(activity -> {
            String dateStr = activity.getDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
            String activityType = activity.getType().name();
            
            System.out.println("ActivityService: Processing activity - Date: " + dateStr + ", Type: " + activityType);
            
            heatmapData.computeIfAbsent(dateStr, k -> new HashMap<>())
                      .merge(activityType, 1, Integer::sum);
        });
        
        // Calculate total activities per date for intensity
        Map<String, Integer> dailyTotals = heatmapData.entrySet().stream()
                .collect(Collectors.toMap(
                    Map.Entry::getKey,
                    entry -> entry.getValue().values().stream().mapToInt(Integer::intValue).sum()
                ));
        
        Map<String, Object> result = new HashMap<>();
        result.put("heatmap", heatmapData);
        result.put("dailyTotals", dailyTotals);
        
        System.out.println("ActivityService: Returning heatmap with " + dailyTotals.size() + " days of data:");
        dailyTotals.forEach((date, count) -> {
            System.out.println("  - " + date + ": " + count + " activities");
        });
        
        return result;
    }
}