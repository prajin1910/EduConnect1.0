package com.stjoseph.assessmentsystem.controller;

import com.stjoseph.assessmentsystem.dto.RoadmapRequest;
import com.stjoseph.assessmentsystem.model.Task;
import com.stjoseph.assessmentsystem.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TaskController {
    
    @Autowired
    private TaskService taskService;
    
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<?> getUserTasks(Authentication auth) {
        try {
            List<Task> tasks = taskService.getUserTasks(auth.getName());
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<?> createTask(@RequestBody RoadmapRequest request, Authentication auth) {
        try {
            Task task = taskService.createTask(request, auth.getName());
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/{taskId}/roadmap")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<?> generateRoadmap(@PathVariable String taskId, Authentication auth) {
        try {
            Task task = taskService.generateRoadmap(taskId, auth.getName());
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{taskId}/status")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<?> updateTaskStatus(@PathVariable String taskId, 
                                            @RequestBody Map<String, String> request, 
                                            Authentication auth) {
        try {
            String status = request.get("status");
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Status is required");
            }
            Task task = taskService.updateTaskStatus(taskId, status, auth.getName());
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}