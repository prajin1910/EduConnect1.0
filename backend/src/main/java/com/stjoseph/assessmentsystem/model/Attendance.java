package com.stjoseph.assessmentsystem.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "attendance")
public class Attendance {
    @Id
    private String id;
    
    private String professorId;
    private String professorName;
    private String department;
    private String className; // I, II, III, IV
    private LocalDate attendanceDate;
    private String period; // Period name/subject
    private String notes; // Additional notes about the class
    private List<StudentAttendance> studentAttendances;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static class StudentAttendance {
        private String studentId;
        private String studentName;
        private String studentEmail;
        private AttendanceStatus status;
        private String remarks; // Optional remarks for individual student
        
        public enum AttendanceStatus {
            PRESENT, ABSENT, LATE, EXCUSED
        }
        
        public StudentAttendance() {}
        
        public StudentAttendance(String studentId, String studentName, String studentEmail, AttendanceStatus status) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.studentEmail = studentEmail;
            this.status = status;
        }
        
        // Getters and Setters
        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        
        public String getStudentEmail() { return studentEmail; }
        public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
        
        public AttendanceStatus getStatus() { return status; }
        public void setStatus(AttendanceStatus status) { this.status = status; }
        
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }
    
    public Attendance() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getProfessorId() { return professorId; }
    public void setProfessorId(String professorId) { this.professorId = professorId; }
    
    public String getProfessorName() { return professorName; }
    public void setProfessorName(String professorName) { this.professorName = professorName; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    
    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }
    
    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public List<StudentAttendance> getStudentAttendances() { return studentAttendances; }
    public void setStudentAttendances(List<StudentAttendance> studentAttendances) { this.studentAttendances = studentAttendances; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}