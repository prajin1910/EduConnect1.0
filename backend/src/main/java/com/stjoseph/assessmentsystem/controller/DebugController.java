package com.stjoseph.assessmentsystem.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.model.Event;
import com.stjoseph.assessmentsystem.service.AlumniDirectoryService;
import com.stjoseph.assessmentsystem.service.AlumniEventService;

@RestController
@RequestMapping("/api/debug")
public class DebugController {
    
    @Autowired
    private AlumniEventService alumniEventService;
    
    @Autowired
    private AlumniDirectoryService alumniDirectoryService;
    
    @GetMapping("/events")
    public ResponseEntity<?> getEvents() {
        try {
            List<Event> events = alumniEventService.getApprovedEvents();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", events.size());
            response.put("events", events);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    @GetMapping("/alumni")
    public ResponseEntity<?> getAlumni() {
        try {
            List<Map<String, Object>> alumni = alumniDirectoryService.getAllVerifiedAlumni();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", alumni.size());
            response.put("alumni", alumni);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("server", "running");
        response.put("time", System.currentTimeMillis());
        response.put("authentication", "bypassed");
        return ResponseEntity.ok(response);
    }
}
