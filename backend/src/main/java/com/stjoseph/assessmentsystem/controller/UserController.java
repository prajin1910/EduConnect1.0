package com.stjoseph.assessmentsystem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.service.UserService;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query, @RequestParam String type) {
        try {
            List<User> users = userService.searchUsers(query, type);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/alumni-directory")
    public ResponseEntity<?> getAlumniDirectory() {
        try {
            List<?> alumni = userService.getApprovedAlumniForDirectory();
            return ResponseEntity.ok(alumni);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/alumni")
    public ResponseEntity<?> getAllAlumni() {
        try {
            List<?> alumni = userService.getApprovedAlumniForDirectory();
            return ResponseEntity.ok(alumni);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}