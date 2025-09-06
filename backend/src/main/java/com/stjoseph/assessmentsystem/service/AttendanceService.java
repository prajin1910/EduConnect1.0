package com.stjoseph.assessmentsystem.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stjoseph.assessmentsystem.model.Attendance;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.AttendanceRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;

@Service
public class AttendanceService {
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ActivityService activityService;
    
    // Get students by department and class for professor
    public List<Map<String, Object>> getStudentsByDepartmentAndClass(String department, String className) {
        try {
            System.out.println("AttendanceService: Getting students for department: " + department + ", class: " + className);
            
            // Validate department parameter
            if (department == null || department.trim().isEmpty()) {
                throw new RuntimeException("Department parameter is required");
            }
            
            // Validate className parameter
            if (className == null || className.trim().isEmpty()) {
                throw new RuntimeException("Class name parameter is required");
            }
            
            // First, let's check all students in the database
            List<User> allStudents = userRepository.findByRole(User.UserRole.STUDENT);
            System.out.println("AttendanceService: Total students in database: " + allStudents.size());
            
            // Log first few students for debugging
            for (int i = 0; i < Math.min(5, allStudents.size()); i++) {
                User student = allStudents.get(i);
                System.out.println("Student " + (i+1) + ": " + student.getName() + 
                                 ", Dept: '" + student.getDepartment() + "'" +
                                 ", Class: '" + student.getClassName() + "'" +
                                 ", Email: " + student.getEmail());
            }
            
            // Debug the exact query parameters
            System.out.println("Query parameters - Department: '" + department + "', Class: '" + className + "'");
            System.out.println("Department length: " + department.length() + ", Class length: " + className.length());
            
            // Check students by department only first
            List<User> departmentStudents = userRepository.findByRoleAndDepartment(User.UserRole.STUDENT, department);
            
            // Log department students for debugging
            for (int i = 0; i < Math.min(3, departmentStudents.size()); i++) {
                User student = departmentStudents.get(i);
                System.out.println("Dept Student " + (i+1) + ": " + student.getName() + 
                                 ", Dept: '" + student.getDepartment() + "'" +
                                 ", Class: '" + student.getClassName() + "'" +
                                 ", Email: " + student.getEmail());
            }
            System.out.println("AttendanceService: Students in department '" + department + "': " + departmentStudents.size());
            
            // Now try the original query with exact department and class match
            List<User> students = userRepository.findByRoleAndDepartmentAndClassName(
                User.UserRole.STUDENT, department, className);
            
            System.out.println("AttendanceService: Found " + students.size() + " students for department: '" + 
                             department + "' and class: '" + className + "'");
            
            // If no students found with exact match, try with verified students only
            if (students.isEmpty()) {
                System.out.println("AttendanceService: No students found with exact match, trying with verified filter");
                students = userRepository.findByRoleAndDepartmentAndClassNameAndVerified(
                    User.UserRole.STUDENT, department, className, true);
                System.out.println("AttendanceService: Found " + students.size() + " verified students");
            }
            
            return students.stream().map(student -> {
                Map<String, Object> studentData = new HashMap<>();
                studentData.put("id", student.getId());
                studentData.put("name", student.getName());
                studentData.put("email", student.getEmail());
                studentData.put("studentId", student.getStudentId());
                studentData.put("department", student.getDepartment());
                studentData.put("className", student.getClassName());
                return studentData;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error getting students: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get students: " + e.getMessage());
        }
    }
    
    // Submit attendance for a class
    public Attendance submitAttendance(String professorEmail, Map<String, Object> attendanceData) {
        try {
            System.out.println("AttendanceService: Submitting attendance for professor: " + professorEmail);
            
            // Find professor
            User professor = userRepository.findByEmail(professorEmail)
                    .orElseThrow(() -> new RuntimeException("Professor not found"));
            
            if (professor.getRole() != User.UserRole.PROFESSOR) {
                throw new RuntimeException("Only professors can submit attendance");
            }
            
            // Use professor's department for filtering students
            String department = (String) attendanceData.get("department");
            if (department == null || department.isEmpty()) {
                department = professor.getDepartment(); // Use professor's department
            }
            
            // Ensure we're using professor's department for security
            if (!department.equalsIgnoreCase(professor.getDepartment())) {
                System.out.println("AttendanceService: Department mismatch - using professor's department: " + professor.getDepartment());
                department = professor.getDepartment();
            }
            
            String className = (String) attendanceData.get("className");
            String dateStr = (String) attendanceData.get("date");
            String period = (String) attendanceData.get("period");
            String notes = (String) attendanceData.get("notes");
            
            System.out.println("AttendanceService: Submitting attendance for department: '" + department + "', class: '" + className + "'");
            
            LocalDate attendanceDate = LocalDate.parse(dateStr);
            
            // Check if attendance already exists for this date, professor, and class
            Optional<Attendance> existingAttendance = attendanceRepository
                    .findByProfessorIdAndDepartmentAndClassNameAndAttendanceDate(
                            professor.getId(), department, className, attendanceDate);
            
            if (existingAttendance.isPresent()) {
                throw new RuntimeException("Attendance already submitted for this date and class");
            }
            
            // Create new attendance record
            Attendance attendance = new Attendance();
            attendance.setProfessorId(professor.getId());
            attendance.setProfessorName(professor.getName());
            attendance.setDepartment(department);
            attendance.setClassName(className);
            attendance.setAttendanceDate(attendanceDate);
            attendance.setPeriod(period);
            attendance.setNotes(notes);
            
            // Process student attendances
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> studentAttendances = (List<Map<String, Object>>) attendanceData.get("studentAttendances");
            
            List<Attendance.StudentAttendance> processedAttendances = new ArrayList<>();
            
            for (Map<String, Object> studentData : studentAttendances) {
                String studentId = (String) studentData.get("studentId");
                String status = (String) studentData.get("status");
                String remarks = (String) studentData.get("remarks");
                
                // Get student details
                Optional<User> studentOpt = userRepository.findById(studentId);
                if (studentOpt.isPresent()) {
                    User student = studentOpt.get();
                    
                    Attendance.StudentAttendance studentAttendance = new Attendance.StudentAttendance();
                    studentAttendance.setStudentId(studentId);
                    studentAttendance.setStudentName(student.getName());
                    studentAttendance.setStudentEmail(student.getEmail());
                    studentAttendance.setStatus(Attendance.StudentAttendance.AttendanceStatus.valueOf(status.toUpperCase()));
                    studentAttendance.setRemarks(remarks);
                    
                    processedAttendances.add(studentAttendance);
                    
                    // Log activity for each student
                    try {
                        String activityDesc = "Attendance marked: " + status + " for " + period + " on " + attendanceDate;
                        activityService.logActivityByUserId(studentId, "CLASS_ATTENDANCE", activityDesc);
                    } catch (Exception e) {
                        System.err.println("Failed to log attendance activity for student " + studentId + ": " + e.getMessage());
                    }
                }
            }
            
            attendance.setStudentAttendances(processedAttendances);
            
            Attendance savedAttendance = attendanceRepository.save(attendance);
            
            System.out.println("AttendanceService: Attendance submitted successfully with ID: " + savedAttendance.getId());
            
            return savedAttendance;
        } catch (Exception e) {
            System.err.println("AttendanceService: Error submitting attendance: " + e.getMessage());
            throw new RuntimeException("Failed to submit attendance: " + e.getMessage());
        }
    }
    
    // Get attendance records for professor
    public List<Attendance> getProfessorAttendanceRecords(String professorEmail, String className) {
        try {
            User professor = userRepository.findByEmail(professorEmail)
                    .orElseThrow(() -> new RuntimeException("Professor not found"));
            
            if (className != null && !className.isEmpty()) {
                return attendanceRepository.findByProfessorIdAndDepartmentAndClassNameOrderByAttendanceDateDesc(
                        professor.getId(), professor.getDepartment(), className);
            } else {
                return attendanceRepository.findByProfessorIdAndDepartmentOrderByAttendanceDateDesc(
                        professor.getId(), professor.getDepartment());
            }
        } catch (Exception e) {
            System.err.println("Error getting professor attendance records: " + e.getMessage());
            throw new RuntimeException("Failed to get attendance records: " + e.getMessage());
        }
    }
    
    // Get student attendance summary
    public Map<String, Object> getStudentAttendanceSummary(String studentId) {
        try {
            System.out.println("AttendanceService: Getting attendance summary for student: " + studentId);
            
            List<Attendance> attendanceRecords = attendanceRepository.findByStudentId(studentId);
            
            int totalDays = attendanceRecords.size();
            int presentDays = 0;
            int absentDays = 0;
            int lateDays = 0;
            int excusedDays = 0;
            
            List<Map<String, Object>> attendanceDetails = new ArrayList<>();
            
            for (Attendance record : attendanceRecords) {
                for (Attendance.StudentAttendance studentAttendance : record.getStudentAttendances()) {
                    if (studentAttendance.getStudentId().equals(studentId)) {
                        Map<String, Object> detail = new HashMap<>();
                        detail.put("date", record.getAttendanceDate().toString());
                        detail.put("period", record.getPeriod());
                        detail.put("status", studentAttendance.getStatus().toString());
                        detail.put("professorName", record.getProfessorName());
                        detail.put("notes", record.getNotes());
                        detail.put("remarks", studentAttendance.getRemarks());
                        attendanceDetails.add(detail);
                        
                        switch (studentAttendance.getStatus()) {
                            case PRESENT:
                                presentDays++;
                                break;
                            case ABSENT:
                                absentDays++;
                                break;
                            case LATE:
                                lateDays++;
                                break;
                            case EXCUSED:
                                excusedDays++;
                                break;
                        }
                        break;
                    }
                }
            }
            
            double attendancePercentage = totalDays > 0 ? ((double) presentDays / totalDays) * 100 : 0;
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalDays", totalDays);
            summary.put("presentDays", presentDays);
            summary.put("absentDays", absentDays);
            summary.put("lateDays", lateDays);
            summary.put("excusedDays", excusedDays);
            summary.put("attendancePercentage", Math.round(attendancePercentage * 100.0) / 100.0);
            summary.put("attendanceDetails", attendanceDetails);
            
            System.out.println("AttendanceService: Attendance summary - Total: " + totalDays + 
                             ", Present: " + presentDays + ", Percentage: " + attendancePercentage + "%");
            
            return summary;
        } catch (Exception e) {
            System.err.println("Error getting student attendance summary: " + e.getMessage());
            throw new RuntimeException("Failed to get attendance summary: " + e.getMessage());
        }
    }
    
    // Get class attendance statistics
    public Map<String, Object> getClassAttendanceStatistics(String department, String className) {
        try {
            List<Attendance> classAttendances = attendanceRepository.findByDepartmentAndClassName(department, className);
            
            Map<String, Object> stats = new HashMap<>();
            
            if (classAttendances.isEmpty()) {
                stats.put("totalSessions", 0);
                stats.put("averageAttendance", 0.0);
                stats.put("studentStats", new ArrayList<>());
                return stats;
            }
            
            // Get all students in this class
            List<User> students = userRepository.findByRoleAndDepartmentAndClassName(
                    User.UserRole.STUDENT, department, className);
            
            Map<String, Map<String, Integer>> studentAttendanceMap = new HashMap<>();
            
            // Initialize student stats
            for (User student : students) {
                Map<String, Integer> studentStats = new HashMap<>();
                studentStats.put("present", 0);
                studentStats.put("absent", 0);
                studentStats.put("late", 0);
                studentStats.put("excused", 0);
                studentStats.put("total", 0);
                studentAttendanceMap.put(student.getId(), studentStats);
            }
            
            // Process attendance records
            for (Attendance record : classAttendances) {
                for (Attendance.StudentAttendance studentAttendance : record.getStudentAttendances()) {
                    String studentId = studentAttendance.getStudentId();
                    if (studentAttendanceMap.containsKey(studentId)) {
                        Map<String, Integer> studentStats = studentAttendanceMap.get(studentId);
                        studentStats.put("total", studentStats.get("total") + 1);
                        
                        switch (studentAttendance.getStatus()) {
                            case PRESENT:
                                studentStats.put("present", studentStats.get("present") + 1);
                                break;
                            case ABSENT:
                                studentStats.put("absent", studentStats.get("absent") + 1);
                                break;
                            case LATE:
                                studentStats.put("late", studentStats.get("late") + 1);
                                break;
                            case EXCUSED:
                                studentStats.put("excused", studentStats.get("excused") + 1);
                                break;
                        }
                    }
                }
            }
            
            // Calculate statistics
            List<Map<String, Object>> studentStatsList = new ArrayList<>();
            double totalAttendancePercentage = 0;
            int studentsWithAttendance = 0;
            
            for (User student : students) {
                Map<String, Integer> studentStats = studentAttendanceMap.get(student.getId());
                int total = studentStats.get("total");
                int present = studentStats.get("present");
                
                if (total > 0) {
                    double percentage = ((double) present / total) * 100;
                    totalAttendancePercentage += percentage;
                    studentsWithAttendance++;
                    
                    Map<String, Object> studentStat = new HashMap<>();
                    studentStat.put("studentId", student.getId());
                    studentStat.put("studentName", student.getName());
                    studentStat.put("studentEmail", student.getEmail());
                    studentStat.put("totalDays", total);
                    studentStat.put("presentDays", present);
                    studentStat.put("absentDays", studentStats.get("absent"));
                    studentStat.put("lateDays", studentStats.get("late"));
                    studentStat.put("excusedDays", studentStats.get("excused"));
                    studentStat.put("attendancePercentage", Math.round(percentage * 100.0) / 100.0);
                    
                    studentStatsList.add(studentStat);
                }
            }
            
            double averageAttendance = studentsWithAttendance > 0 ? 
                    totalAttendancePercentage / studentsWithAttendance : 0;
            
            stats.put("totalSessions", classAttendances.size());
            stats.put("averageAttendance", Math.round(averageAttendance * 100.0) / 100.0);
            stats.put("studentStats", studentStatsList);
            stats.put("totalStudents", students.size());
            
            return stats;
        } catch (Exception e) {
            System.err.println("Error getting class attendance statistics: " + e.getMessage());
            throw new RuntimeException("Failed to get class statistics: " + e.getMessage());
        }
    }
    
    // Get attendance records for management (all departments)
    public List<Attendance> getAllAttendanceRecords() {
        return attendanceRepository.findAll();
    }
    
    // Get attendance records by department for management
    public List<Attendance> getAttendanceByDepartment(String department) {
        return attendanceRepository.findByDepartmentOrderByAttendanceDateDesc(department);
    }
    
    // Update attendance record
    public Attendance updateAttendance(String attendanceId, Map<String, Object> updateData, String professorEmail) {
        try {
            User professor = userRepository.findByEmail(professorEmail)
                    .orElseThrow(() -> new RuntimeException("Professor not found"));
            
            Attendance attendance = attendanceRepository.findById(attendanceId)
                    .orElseThrow(() -> new RuntimeException("Attendance record not found"));
            
            // Verify professor owns this attendance record
            if (!attendance.getProfessorId().equals(professor.getId())) {
                throw new RuntimeException("You can only update your own attendance records");
            }
            
            // Update fields
            if (updateData.containsKey("period")) {
                attendance.setPeriod((String) updateData.get("period"));
            }
            if (updateData.containsKey("notes")) {
                attendance.setNotes((String) updateData.get("notes"));
            }
            
            // Update student attendances if provided
            if (updateData.containsKey("studentAttendances")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> studentAttendances = (List<Map<String, Object>>) updateData.get("studentAttendances");
                
                List<Attendance.StudentAttendance> updatedAttendances = new ArrayList<>();
                
                for (Map<String, Object> studentData : studentAttendances) {
                    String studentId = (String) studentData.get("studentId");
                    String status = (String) studentData.get("status");
                    String remarks = (String) studentData.get("remarks");
                    
                    // Find existing student attendance
                    Optional<Attendance.StudentAttendance> existingStudentAttendance = 
                            attendance.getStudentAttendances().stream()
                                    .filter(sa -> sa.getStudentId().equals(studentId))
                                    .findFirst();
                    
                    if (existingStudentAttendance.isPresent()) {
                        Attendance.StudentAttendance studentAttendance = existingStudentAttendance.get();
                        studentAttendance.setStatus(Attendance.StudentAttendance.AttendanceStatus.valueOf(status.toUpperCase()));
                        studentAttendance.setRemarks(remarks);
                        updatedAttendances.add(studentAttendance);
                    }
                }
                
                attendance.setStudentAttendances(updatedAttendances);
            }
            
            attendance.setUpdatedAt(LocalDateTime.now());
            
            return attendanceRepository.save(attendance);
        } catch (Exception e) {
            System.err.println("Error updating attendance: " + e.getMessage());
            throw new RuntimeException("Failed to update attendance: " + e.getMessage());
        }
    }
    
    // Delete attendance record
    public void deleteAttendance(String attendanceId, String professorEmail) {
        try {
            User professor = userRepository.findByEmail(professorEmail)
                    .orElseThrow(() -> new RuntimeException("Professor not found"));
            
            Attendance attendance = attendanceRepository.findById(attendanceId)
                    .orElseThrow(() -> new RuntimeException("Attendance record not found"));
            
            // Verify professor owns this attendance record
            if (!attendance.getProfessorId().equals(professor.getId())) {
                throw new RuntimeException("You can only delete your own attendance records");
            }
            
            attendanceRepository.deleteById(attendanceId);
        } catch (Exception e) {
            System.err.println("Error deleting attendance: " + e.getMessage());
            throw new RuntimeException("Failed to delete attendance: " + e.getMessage());
        }
    }
    
    // Get attendance summary for a student (for student portal)
    public Map<String, Object> getMyAttendanceSummary(String studentEmail) {
        try {
            User student = userRepository.findByEmail(studentEmail)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            return getStudentAttendanceSummary(student.getId());
        } catch (Exception e) {
            System.err.println("Error getting student attendance summary: " + e.getMessage());
            throw new RuntimeException("Failed to get attendance summary: " + e.getMessage());
        }
    }
    
    // Get classes taught by professor
    public List<String> getProfessorClasses(String professorEmail) {
        try {
            User professor = userRepository.findByEmail(professorEmail)
                    .orElseThrow(() -> new RuntimeException("Professor not found"));
            
            // Get distinct class names from attendance records
            List<Attendance> attendances = attendanceRepository.findByProfessorIdAndDepartmentOrderByAttendanceDateDesc(
                    professor.getId(), professor.getDepartment());
            
            List<String> classes = attendances.stream()
                    .map(Attendance::getClassName)
                    .distinct()
                    .collect(Collectors.toList());
            
            // If no attendance records, return default classes
            if (classes.isEmpty()) {
                classes = List.of("I", "II", "III", "IV");
            }
            
            return classes;
        } catch (Exception e) {
            System.err.println("Error getting professor classes: " + e.getMessage());
            return List.of("I", "II", "III", "IV"); // Default classes
        }
    }
    
    // Debug method to get all users
    public List<Map<String, Object>> getAllUsersForDebug() {
        try {
            List<User> allUsers = userRepository.findAll();
            
            return allUsers.stream().map(user -> {
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId());
                userData.put("name", user.getName());
                userData.put("email", user.getEmail());
                userData.put("role", user.getRole().toString());
                userData.put("department", user.getDepartment());
                userData.put("className", user.getClassName());
                userData.put("studentId", user.getStudentId());
                userData.put("verified", user.isVerified());
                return userData;
            }).collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error getting all users for debug: " + e.getMessage());
            throw new RuntimeException("Failed to get users: " + e.getMessage());
        }
    }
}