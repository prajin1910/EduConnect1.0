package com.stjoseph.assessmentsystem.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
import org.springframework.web.multipart.MultipartFile;

import com.stjoseph.assessmentsystem.model.Resume;
import com.stjoseph.assessmentsystem.service.ResumeService;

@RestController
@RequestMapping("/resumes")
@CrossOrigin(origins = "*")
public class ResumeController {
    
    @Autowired
    private ResumeService resumeService;
    
    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            System.out.println("ResumeController: Upload request from user " + authentication.getName());
            String userId = authentication.getName();
            Resume resume = resumeService.uploadResume(file, userId);
            System.out.println("ResumeController: Upload successful for resume " + resume.getId());
            return ResponseEntity.ok(resume);
        } catch (IllegalArgumentException e) {
            System.err.println("ResumeController: Invalid request - " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("ResumeController: Upload failed - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload resume: " + e.getMessage()));
        }
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<Resume>> getMyResumes(Authentication authentication) {
        try {
            String userId = authentication.getName();
            List<Resume> resumes = resumeService.getUserResumes(userId);
            return ResponseEntity.ok(resumes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/current")
    public ResponseEntity<Resume> getCurrentResume(Authentication authentication) {
        try {
            String userId = authentication.getName();
            Resume resume = resumeService.getCurrentResume(userId);
            if (resume != null) {
                return ResponseEntity.ok(resume);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Resume> getResume(@PathVariable String id, Authentication authentication) {
        try {
            Resume resume = resumeService.getResume(id);
            if (resume != null) {
                return ResponseEntity.ok(resume);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadResume(@PathVariable String id, Authentication authentication) {
        try {
            Resume resume = resumeService.getResume(id);
            if (resume != null) {
                byte[] fileData = resumeService.downloadResume(id);
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                headers.setContentDispositionFormData("attachment", resume.getFileName());
                
                return ResponseEntity.ok()
                        .headers(headers)
                        .body(fileData);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/activate")
    public ResponseEntity<Void> activateResume(@PathVariable String id, Authentication authentication) {
        try {
            String userId = authentication.getName();
            resumeService.activateResume(id, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(@PathVariable String id, Authentication authentication) {
        try {
            String userId = authentication.getName();
            resumeService.deleteResume(id, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Resume> updateResume(
            @PathVariable String id,
            @RequestBody Resume resumeData,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            Resume updatedResume = resumeService.updateResume(id, resumeData, userId);
            return ResponseEntity.ok(updatedResume);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/rename")
    public ResponseEntity<?> renameResume(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String newFileName = request.get("fileName");
            if (newFileName == null || newFileName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File name is required"));
            }
            
            String userId = authentication.getName();
            Resume resume = resumeService.renameResume(id, newFileName.trim(), userId);
            return ResponseEntity.ok(resume);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to rename resume"));
        }
    }
    
    @PostMapping("/{id}/analyze-ats")
    public ResponseEntity<?> analyzeATS(@PathVariable String id, Authentication authentication) {
        try {
            System.out.println("ResumeController: ATS analysis request for resume " + id);
            String userId = authentication.getName();
            Resume resume = resumeService.triggerATSAnalysis(id, userId);
            System.out.println("ResumeController: ATS analysis completed");
            return ResponseEntity.ok(resume);
        } catch (IllegalArgumentException e) {
            System.err.println("ResumeController: ATS analysis failed - " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("ResumeController: ATS analysis error - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "ATS analysis failed: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/send-ats-to-management")
    public ResponseEntity<?> sendATSToManagement(@PathVariable String id, Authentication authentication) {
        try {
            System.out.println("ResumeController: Send ATS to management request for resume " + id);
            String userId = authentication.getName();
            
            // First verify the resume belongs to the user
            Resume resume = resumeService.getResumeById(id);
            if (resume == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Resume not found"));
            }
            
            if (!resume.getUserId().equals(userId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unauthorized access to resume"));
            }
            
            if (resume.getAtsAnalysis() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No ATS analysis found for this resume"));
            }
            
            Resume updatedResume = resumeService.markResumeAsSentToManagement(id);
            System.out.println("ResumeController: ATS analysis sent to management successfully");
            return ResponseEntity.ok(updatedResume);
            
        } catch (IllegalArgumentException e) {
            System.err.println("ResumeController: Send to management failed - " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("ResumeController: Send to management error - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send to management: " + e.getMessage()));
        }
    }
    
    // Management endpoints
    @GetMapping("/management/all")
    public ResponseEntity<List<Resume>> getAllStudentResumes() {
        try {
            List<Resume> resumes = resumeService.getAllStudentResumes();
            return ResponseEntity.ok(resumes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/management/with-ats")
    public ResponseEntity<List<Resume>> getResumesWithATS() {
        try {
            List<Resume> resumes = resumeService.getResumesWithATSAnalysis();
            return ResponseEntity.ok(resumes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/management/analyze-students")
    public ResponseEntity<?> analyzeStudentProfiles(@RequestBody Map<String, String> request) {
        try {
            String query = request.get("query");
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Query is required"));
            }
            
            System.out.println("ResumeController: Student analysis request: " + query);
            String analysis = resumeService.analyzeStudentProfiles(query.trim());
            System.out.println("ResumeController: Student analysis completed");
            
            return ResponseEntity.ok(Map.of("analysis", analysis));
        } catch (Exception e) {
            System.err.println("ResumeController: Student analysis error - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Analysis failed: " + e.getMessage()));
        }
    }
    
    @PostMapping("/management/{id}/mark-sent")
    public ResponseEntity<?> markResumeAsSent(@PathVariable String id) {
        try {
            Resume resume = resumeService.markResumeAsSentToManagement(id);
            return ResponseEntity.ok(resume);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to mark resume as sent"));
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<Resume> getUserCurrentResume(@PathVariable String userId) {
        try {
            Resume resume = resumeService.getCurrentResume(userId);
            if (resume != null) {
                return ResponseEntity.ok(resume);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
