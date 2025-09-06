package com.stjoseph.assessmentsystem.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.stjoseph.assessmentsystem.model.Attendance;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    
    // Find attendance by professor and department
    List<Attendance> findByProfessorIdAndDepartmentOrderByAttendanceDateDesc(String professorId, String department);
    
    // Find attendance by professor, department and class
    List<Attendance> findByProfessorIdAndDepartmentAndClassNameOrderByAttendanceDateDesc(String professorId, String department, String className);
    
    // Find attendance by date range
    @Query("{ 'professorId': ?0, 'attendanceDate': { $gte: ?1, $lte: ?2 } }")
    List<Attendance> findByProfessorIdAndDateRange(String professorId, LocalDate startDate, LocalDate endDate);
    
    // Find attendance for a specific student
    @Query("{ 'studentAttendances.studentId': ?0 }")
    List<Attendance> findByStudentId(String studentId);
    
    // Find attendance for a specific student in date range
    @Query("{ 'studentAttendances.studentId': ?0, 'attendanceDate': { $gte: ?1, $lte: ?2 } }")
    List<Attendance> findByStudentIdAndDateRange(String studentId, LocalDate startDate, LocalDate endDate);
    
    // Find attendance by department and class (for management)
    List<Attendance> findByDepartmentAndClassNameOrderByAttendanceDateDesc(String department, String className);
    
    // Find attendance by department (for management)
    List<Attendance> findByDepartmentOrderByAttendanceDateDesc(String department);
    
    // Check if attendance already exists for a specific date, professor, and class
    Optional<Attendance> findByProfessorIdAndDepartmentAndClassNameAndAttendanceDate(
        String professorId, String department, String className, LocalDate attendanceDate);
    
    // Count total attendance records for a student
    @Query(value = "{ 'studentAttendances.studentId': ?0 }", count = true)
    long countByStudentId(String studentId);
    
    // Count present days for a student
    @Query("{ 'studentAttendances': { $elemMatch: { 'studentId': ?0, 'status': 'PRESENT' } } }")
    List<Attendance> findPresentAttendanceByStudentId(String studentId);
    
    // Get attendance statistics for a class
    List<Attendance> findByDepartmentAndClassName(String department, String className);
}