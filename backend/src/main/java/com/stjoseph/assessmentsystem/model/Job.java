package com.stjoseph.assessmentsystem.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "jobs")
public class Job {
    @Id
    private String id;
    
    private String title;
    private String company;
    private String companyDescription;
    private String companyWebsite;
    private String companyLogo;
    private String location;
    private String workMode; // Remote, Hybrid, On-site
    private JobType type;
    private String salary;
    private String salaryMin;
    private String salaryMax;
    private String currency;
    private String description;
    private List<String> requirements;
    private List<String> responsibilities;
    private List<String> benefits;
    private List<String> skillsRequired;
    private String experienceLevel; // Entry, Mid, Senior
    private Integer minExperience;
    private Integer maxExperience;
    private String educationLevel;
    private String industry;
    private String department;
    private String employmentDuration;
    private LocalDateTime applicationDeadline;
    private String postedBy; // Alumni user ID
    private String postedByName;
    private String postedByEmail;
    private String postedByDesignation;
    private String postedByCompany;
    private LocalDateTime postedAt;
    private String applicationUrl;
    private String contactEmail;
    private String contactPhone;
    private JobStatus status;
    private Integer viewCount;
    private Integer applicationCount;
    
    public enum JobType {
        FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT
    }
    
    public enum JobStatus {
        ACTIVE, EXPIRED, DRAFT
    }
    
    public Job() {
        this.postedAt = LocalDateTime.now();
        this.status = JobStatus.ACTIVE;
        this.viewCount = 0;
        this.applicationCount = 0;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    
    public String getCompanyDescription() { return companyDescription; }
    public void setCompanyDescription(String companyDescription) { this.companyDescription = companyDescription; }
    
    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }
    
    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }
    
    public JobType getType() { return type; }
    public void setType(JobType type) { this.type = type; }
    
    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }
    
    public String getSalaryMin() { return salaryMin; }
    public void setSalaryMin(String salaryMin) { this.salaryMin = salaryMin; }
    
    public String getSalaryMax() { return salaryMax; }
    public void setSalaryMax(String salaryMax) { this.salaryMax = salaryMax; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public List<String> getRequirements() { return requirements; }
    public void setRequirements(List<String> requirements) { this.requirements = requirements; }
    
    public List<String> getResponsibilities() { return responsibilities; }
    public void setResponsibilities(List<String> responsibilities) { this.responsibilities = responsibilities; }
    
    public List<String> getBenefits() { return benefits; }
    public void setBenefits(List<String> benefits) { this.benefits = benefits; }
    
    public List<String> getSkillsRequired() { return skillsRequired; }
    public void setSkillsRequired(List<String> skillsRequired) { this.skillsRequired = skillsRequired; }
    
    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
    
    public Integer getMinExperience() { return minExperience; }
    public void setMinExperience(Integer minExperience) { this.minExperience = minExperience; }
    
    public Integer getMaxExperience() { return maxExperience; }
    public void setMaxExperience(Integer maxExperience) { this.maxExperience = maxExperience; }
    
    public String getEducationLevel() { return educationLevel; }
    public void setEducationLevel(String educationLevel) { this.educationLevel = educationLevel; }
    
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getEmploymentDuration() { return employmentDuration; }
    public void setEmploymentDuration(String employmentDuration) { this.employmentDuration = employmentDuration; }
    
    public LocalDateTime getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDateTime applicationDeadline) { this.applicationDeadline = applicationDeadline; }
    
    public String getPostedBy() { return postedBy; }
    public void setPostedBy(String postedBy) { this.postedBy = postedBy; }
    
    public String getPostedByName() { return postedByName; }
    public void setPostedByName(String postedByName) { this.postedByName = postedByName; }
    
    public String getPostedByEmail() { return postedByEmail; }
    public void setPostedByEmail(String postedByEmail) { this.postedByEmail = postedByEmail; }
    
    public String getPostedByDesignation() { return postedByDesignation; }
    public void setPostedByDesignation(String postedByDesignation) { this.postedByDesignation = postedByDesignation; }
    
    public String getPostedByCompany() { return postedByCompany; }
    public void setPostedByCompany(String postedByCompany) { this.postedByCompany = postedByCompany; }
    
    public LocalDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }
    
    public String getApplicationUrl() { return applicationUrl; }
    public void setApplicationUrl(String applicationUrl) { this.applicationUrl = applicationUrl; }
    
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    
    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }
    
    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }
    
    public Integer getApplicationCount() { return applicationCount; }
    public void setApplicationCount(Integer applicationCount) { this.applicationCount = applicationCount; }
}
