package com.stjoseph.assessmentsystem.model;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Document(collection = "users")
public class User implements UserDetails {
    @Id
    private String id;
    
    private String name;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    private String phoneNumber;
    private String department;
    private String className;
    private UserRole role;
    private boolean verified;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    
    // Additional profile fields
    private String profilePicture;
    private String bio;
    private java.util.List<String> skills;
    private String location;
    private LocalDateTime lastActive;
    
    // Student-specific fields
    private String studentId;
    private String course;
    private String year;
    private String semester;
    private Double cgpa;
    
    // Professor-specific fields
    private String employeeId;
    private String designation;
    private Integer experience;
    private java.util.List<String> subjectsTeaching;
    private java.util.List<String> researchInterests;
    private Integer publications;
    private Integer studentsSupervised;
    
    // Alumni-specific fields
    private Integer graduationYear;
    private String currentCompany;
    private String currentPosition;
    private Integer workExperience;
    private java.util.List<String> achievements;
    private Boolean mentorshipAvailable;
    
    // Statistics fields
    private Integer aiAssessmentCount;
    private Integer connectionCount;
    
    // Enhanced profile fields
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String personalWebsite;
    private String aboutMe;
    private java.util.List<String> certifications;
    private java.util.List<String> projects;
    private String jobTitle;
    private String industry;
    private String workLocation;
    private Integer salaryRange;
    private Boolean isAvailableForJobRequests;
    private String specialization;
    private java.util.List<String> technicalSkills;
    private java.util.List<String> softSkills;
    private java.util.List<String> languages;
    private String previousCompanies;
    private String educationDetails;
    
    public enum UserRole {
        STUDENT, PROFESSOR, MANAGEMENT, ALUMNI
    }
    
    public User() {
        this.createdAt = LocalDateTime.now();
        this.verified = false;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    
    @Override
    public String getUsername() {
        return email;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return verified;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
    
    // Additional profile field getters and setters
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public java.util.List<String> getSkills() { return skills; }
    public void setSkills(java.util.List<String> skills) { this.skills = skills; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public LocalDateTime getLastActive() { return lastActive; }
    public void setLastActive(LocalDateTime lastActive) { this.lastActive = lastActive; }
    
    // Student-specific getters and setters
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    
    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }
    
    // Professor-specific getters and setters
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    
    public Integer getExperience() { return experience; }
    public void setExperience(Integer experience) { this.experience = experience; }
    
    public java.util.List<String> getSubjectsTeaching() { return subjectsTeaching; }
    public void setSubjectsTeaching(java.util.List<String> subjectsTeaching) { this.subjectsTeaching = subjectsTeaching; }
    
    public java.util.List<String> getResearchInterests() { return researchInterests; }
    public void setResearchInterests(java.util.List<String> researchInterests) { this.researchInterests = researchInterests; }
    
    public Integer getPublications() { return publications; }
    public void setPublications(Integer publications) { this.publications = publications; }
    
    public Integer getStudentsSupervised() { return studentsSupervised; }
    public void setStudentsSupervised(Integer studentsSupervised) { this.studentsSupervised = studentsSupervised; }
    
    // Alumni-specific getters and setters
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    
    public String getCurrentCompany() { return currentCompany; }
    public void setCurrentCompany(String currentCompany) { this.currentCompany = currentCompany; }
    
    public String getCurrentPosition() { return currentPosition; }
    public void setCurrentPosition(String currentPosition) { this.currentPosition = currentPosition; }
    
    public Integer getWorkExperience() { return workExperience; }
    public void setWorkExperience(Integer workExperience) { this.workExperience = workExperience; }
    
    public java.util.List<String> getAchievements() { return achievements; }
    public void setAchievements(java.util.List<String> achievements) { this.achievements = achievements; }
    
    public Boolean getMentorshipAvailable() { return mentorshipAvailable; }
    public void setMentorshipAvailable(Boolean mentorshipAvailable) { this.mentorshipAvailable = mentorshipAvailable; }
    
    // Enhanced profile field getters and setters
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    
    public String getPersonalWebsite() { return personalWebsite; }
    public void setPersonalWebsite(String personalWebsite) { this.personalWebsite = personalWebsite; }
    
    public String getAboutMe() { return aboutMe; }
    public void setAboutMe(String aboutMe) { this.aboutMe = aboutMe; }
    
    public java.util.List<String> getCertifications() { return certifications; }
    public void setCertifications(java.util.List<String> certifications) { this.certifications = certifications; }
    
    public java.util.List<String> getProjects() { return projects; }
    public void setProjects(java.util.List<String> projects) { this.projects = projects; }
    
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    
    public String getWorkLocation() { return workLocation; }
    public void setWorkLocation(String workLocation) { this.workLocation = workLocation; }
    
    public Integer getSalaryRange() { return salaryRange; }
    public void setSalaryRange(Integer salaryRange) { this.salaryRange = salaryRange; }
    
    public Boolean getIsAvailableForJobRequests() { return isAvailableForJobRequests; }
    public void setIsAvailableForJobRequests(Boolean isAvailableForJobRequests) { this.isAvailableForJobRequests = isAvailableForJobRequests; }
    
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    
    public java.util.List<String> getTechnicalSkills() { return technicalSkills; }
    public void setTechnicalSkills(java.util.List<String> technicalSkills) { this.technicalSkills = technicalSkills; }
    
    public java.util.List<String> getSoftSkills() { return softSkills; }
    public void setSoftSkills(java.util.List<String> softSkills) { this.softSkills = softSkills; }
    
    public java.util.List<String> getLanguages() { return languages; }
    public void setLanguages(java.util.List<String> languages) { this.languages = languages; }
    
    public String getPreviousCompanies() { return previousCompanies; }
    public void setPreviousCompanies(String previousCompanies) { this.previousCompanies = previousCompanies; }
    
    public String getEducationDetails() { return educationDetails; }
    public void setEducationDetails(String educationDetails) { this.educationDetails = educationDetails; }
    
    public String getPhone() { return phoneNumber; }
    public void setPhone(String phone) { this.phoneNumber = phone; }
    
    // Statistics getters and setters
    public Integer getAiAssessmentCount() { return aiAssessmentCount; }
    public void setAiAssessmentCount(Integer aiAssessmentCount) { this.aiAssessmentCount = aiAssessmentCount; }
    
    public Integer getConnectionCount() { return connectionCount; }
    public void setConnectionCount(Integer connectionCount) { this.connectionCount = connectionCount; }
}