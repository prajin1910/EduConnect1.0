package com.stjoseph.assessmentsystem.service;

import com.stjoseph.assessmentsystem.dto.RoadmapRequest;
import com.stjoseph.assessmentsystem.model.Task;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.TaskRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AIService aiService;
    
    @Autowired
    private ActivityService activityService;
    
    public List<Task> getUserTasks(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return taskRepository.findByUserId(user.getId());
    }
    
    public Task createTask(RoadmapRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Task task = new Task();
        task.setUserId(user.getId());
        task.setTaskName(request.getTaskName());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setStatus(Task.TaskStatus.PENDING);
        
        Task saved = taskRepository.save(task);
        
        // Log activity
        try {
            activityService.logActivityByUserId(user.getId(), "TASK_MANAGEMENT", 
                    "Created task: " + task.getTaskName());
            System.out.println("TaskService: Activity logged for task creation");
        } catch (Exception e) {
            System.err.println("TaskService: Failed to log task creation activity: " + e.getMessage());
        }
        
        return saved;
    }
    
    public Task generateRoadmap(String taskId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!task.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to task");
        }
        
        RoadmapRequest request = new RoadmapRequest();
        request.setTaskName(task.getTaskName());
        request.setDescription(task.getDescription());
        request.setDueDate(task.getDueDate());
        
        List<String> roadmap = aiService.generateRoadmap(request);
        task.setRoadmap(roadmap);
        task.setRoadmapGenerated(true);
        
        Task saved = taskRepository.save(task);
        
        // Log activity
        try {
            activityService.logActivityByUserId(user.getId(), "TASK_MANAGEMENT", 
                    "Generated roadmap for task: " + task.getTaskName());
            System.out.println("TaskService: Activity logged for roadmap generation");
        } catch (Exception e) {
            System.err.println("TaskService: Failed to log roadmap generation activity: " + e.getMessage());
        }
        
        return saved;
    }
    
    public Task updateTaskStatus(String taskId, String status, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!task.getUserId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to task");
        }
        
        task.setStatus(Task.TaskStatus.valueOf(status.toUpperCase()));
        
        // Check if task is overdue
        if (task.getDueDate().isBefore(LocalDate.now()) && 
            task.getStatus() != Task.TaskStatus.COMPLETED) {
            task.setStatus(Task.TaskStatus.OVERDUE);
        }
        
        return taskRepository.save(task);
    }
}