package com.stjoseph.assessmentsystem.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stjoseph.assessmentsystem.model.Attendance;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.UserRepository;
import com.stjoseph.assessmentsystem.service.AttendanceService;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AttendanceController {
    
    @Autowired
    private AttendanceService attendanceService;
    
    @Autowired
    private UserRepository userRepository;
    
    // Debug endpoint - get all users (no auth required)
    @GetMapping("/debug/all-users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> allUsers = userRepository.findAll();
            return ResponseEntity.ok(allUsers.stream()
                .map(user -> Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "role", user.getRole().toString(),
                    "department", user.getDepartment() != null ? user.getDepartment() : "null",
                    "className", user.getClassName() != null ? user.getClassName() : "null",
                    "verified", user.isVerified()
                ))
                .collect(Collectors.toList())
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Simple test endpoint to debug student queries (no auth required)
    @GetMapping("/test/students")
    public ResponseEntity<?> testGetStudents(@RequestParam String department, 
                                           @RequestParam String className) {
        try {
            System.out.println("=== TEST ENDPOINT CALLED ===");
            System.out.println("Department parameter: '" + department + "'");
            System.out.println("ClassName parameter: '" + className + "'");
            
            List<Map<String, Object>> students = attendanceService.getStudentsByDepartmentAndClass(department, className);
            
            System.out.println("=== TEST ENDPOINT RESULT ===");
            System.out.println("Found " + students.size() + " students");
            
            return ResponseEntity.ok(Map.of(
                "students", students,
                "count", students.size(),
                "department", department,
                "className", className
            ));
        } catch (Exception e) {
            System.err.println("Test endpoint error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // NO AUTH VERSION - for testing only
    @GetMapping("/students-no-auth")
    public ResponseEntity<?> getStudentsByClassNoAuth(@RequestParam String department, 
                                                     @RequestParam String className) {
        try {
            System.out.println("=== NO AUTH ENDPOINT ===");
            List<Map<String, Object>> students = attendanceService.getStudentsByDepartmentAndClass(department, className);
            System.out.println("No-auth endpoint returning " + students.size() + " students");
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            System.err.println("No-auth endpoint error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get students by department and class (for professors) - SIMPLIFIED
    @GetMapping("/students")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<?> getStudentsByClass(@RequestParam String department, 
                                               @RequestParam String className,
                                               Authentication authentication) {
        try {
            System.out.println("=== ATTENDANCE CONTROLLER ===");
            System.out.println("Professor: " + authentication.getName());
            
            // Get professor's department to ensure they only see their department students
            String professorEmail = authentication.getName();
            User professor = userRepository.findByEmail(professorEmail)
                    .orElseThrow(() -> new RuntimeException("Professor not found"));
            
            String professorDepartment = professor.getDepartment();
            System.out.println("Professor department from DB: '" + professorDepartment + "'");
            System.out.println("Requested department: '" + department + "'");
            
            // Check if professor department is null or empty
            if (professorDepartment == null || professorDepartment.trim().isEmpty()) {
                System.err.println("Professor department is null or empty for: " + professorEmail);
                return ResponseEntity.badRequest().body(Map.of("error", "Professor department not set. Please contact administration to update your department information."));
            }
            
            // Normalize department names for comparison (trim and case-insensitive)
            String normalizedProfDept = professorDepartment.trim();
            String normalizedReqDept = department.trim();
            
            System.out.println("Normalized professor department: '" + normalizedProfDept + "'");
            System.out.println("Normalized requested department: '" + normalizedReqDept + "'");
            
            // Only allow professors to see students from their own department (case-insensitive comparison)
            if (!normalizedReqDept.equalsIgnoreCase(normalizedProfDept)) {
                System.out.println("Professor trying to access different department students - denied");
                return ResponseEntity.badRequest().body(Map.of("error", 
                    "You can only view students from your own department (" + professorDepartment + "). Requested: " + department));
            }
            
            System.out.println("Requesting students for:");
            System.out.println("  Department: '" + professorDepartment + "' (using professor's department)");
            System.out.println("  Class: '" + className + "'");
            
            // Use professor's actual department for the query
            List<Map<String, Object>> students = attendanceService.getStudentsByDepartmentAndClass(professorDepartment, className);
            
            System.out.println("Controller returning " + students.size() + " students");
            System.out.println("=== END ATTENDANCE CONTROLLER ===\n");
            
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            System.err.println("AttendanceController error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Submit attendance (for professors)
    @PostMapping("/submit")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<?> submitAttendance(@RequestBody Map<String, Object> attendanceData,
                                             Authentication authentication) {
        try {
            String professorEmail = authentication.getName();
            Attendance attendance = attendanceService.submitAttendance(professorEmail, attendanceData);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Attendance submitted successfully",
                "attendanceId", attendance.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get professor's attendance records
    @GetMapping("/professor/records")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<?> getProfessorAttendanceRecords(@RequestParam(required = false) String className,
                                                          Authentication authentication) {
        try {
            String professorEmail = authentication.getName();
            List<Attendance> records = attendanceService.getProfessorAttendanceRecords(professorEmail, className);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get professor's classes
    @GetMapping("/professor/classes")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<?> getProfessorClasses(Authentication authentication) {
        try {
            String professorEmail = authentication.getName();
            List<String> classes = attendanceService.getProfessorClasses(professorEmail);
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Update attendance record (for professors)
    @PutMapping("/{attendanceId}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<?> updateAttendance(@PathVariable String attendanceId,
                                             @RequestBody Map<String, Object> updateData,
                                             Authentication authentication) {
        try {
            String professorEmail = authentication.getName();
            Attendance updatedAttendance = attendanceService.updateAttendance(attendanceId, updateData, professorEmail);
            return ResponseEntity.ok(updatedAttendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Delete attendance record (for professors)
    @DeleteMapping("/{attendanceId}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<?> deleteAttendance(@PathVariable String attendanceId,
                                             Authentication authentication) {
        try {
            String professorEmail = authentication.getName();
            attendanceService.deleteAttendance(attendanceId, professorEmail);
            return ResponseEntity.ok(Map.of("message", "Attendance record deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get student attendance summary (for students)
    @GetMapping("/student/my-summary")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<?> getMyAttendanceSummary(Authentication authentication) {
        try {
            String studentEmail = authentication.getName();
            Map<String, Object> summary = attendanceService.getMyAttendanceSummary(studentEmail);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get student attendance summary by ID (for management and professors)
    @GetMapping("/student/{studentId}/summary")
    @PreAuthorize("hasAnyAuthority('ROLE_PROFESSOR', 'ROLE_MANAGEMENT')")
    public ResponseEntity<?> getStudentAttendanceSummary(@PathVariable String studentId) {
        try {
            Map<String, Object> summary = attendanceService.getStudentAttendanceSummary(studentId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get class attendance statistics (for management and professors)
    @GetMapping("/class/statistics")
    @PreAuthorize("hasAnyAuthority('ROLE_PROFESSOR', 'ROLE_MANAGEMENT')")
    public ResponseEntity<?> getClassAttendanceStatistics(@RequestParam String department,
                                                         @RequestParam String className) {
        try {
            Map<String, Object> stats = attendanceService.getClassAttendanceStatistics(department, className);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get all attendance records (for management)
    @GetMapping("/management/all")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> getAllAttendanceRecords() {
        try {
            List<Attendance> records = attendanceService.getAllAttendanceRecords();
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get attendance by department (for management)
    @GetMapping("/management/department/{department}")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT')")
    public ResponseEntity<?> getAttendanceByDepartment(@PathVariable String department) {
        try {
            List<Attendance> records = attendanceService.getAttendanceByDepartment(department);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Debug endpoint - get all users with auth (temporary for debugging)
    @GetMapping("/debug/all-users-auth")
    @PreAuthorize("hasAnyAuthority('ROLE_PROFESSOR', 'ROLE_MANAGEMENT')")
    public ResponseEntity<?> getAllUsersDebug(Authentication authentication) {
        try {
            System.out.println("Debug: Getting all users for debugging by " + authentication.getName());
            List<Map<String, Object>> allUsers = attendanceService.getAllUsersForDebug();
            return ResponseEntity.ok(allUsers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}