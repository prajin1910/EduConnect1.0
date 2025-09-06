package com.stjoseph.assessmentsystem.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.stjoseph.assessmentsystem.model.Resume;
import com.stjoseph.assessmentsystem.repository.ResumeRepository;

@Service
public class ResumeService {
    
    @Autowired
    private ResumeRepository resumeRepository;
    
    @Autowired
    private GeminiAIService geminiAIService;
    
    @Value("${app.upload.dir:uploads/resumes}")
    private String uploadDir;
    
    public Resume uploadResume(MultipartFile file, String userId) throws IOException {
        System.out.println("ResumeService: Starting resume upload for user " + userId);
        
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.isEmpty()) {
            throw new IllegalArgumentException("Invalid file name");
        }
        
        // Check file type
        String fileType = file.getContentType();
        if (!isValidFileType(fileType)) {
            throw new IllegalArgumentException("Invalid file type. Only PDF, DOC, and DOCX files are allowed");
        }
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique file name
        String fileExtension = getFileExtension(fileName);
        String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;
        Path filePath = uploadPath.resolve(uniqueFileName);
        
        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("ResumeService: File saved to " + filePath);
        
        // Extract text from the file
        String extractedText = extractTextFromFile(file, fileExtension);
        
        // Deactivate previous resumes
        List<Resume> existingResumes = resumeRepository.findByUserIdAndIsActiveTrue(userId);
        existingResumes.forEach(resume -> {
            resume.setActive(false);
            resumeRepository.save(resume);
        });
        
        // Create resume record
        Resume resume = new Resume();
        resume.setUserId(userId);
        resume.setFileName(fileName);
        resume.setFilePath(filePath.toString());
        resume.setFileType(fileType);
        resume.setFileSize(file.getSize());
        resume.setExtractedText(extractedText);
        resume.setUploadedAt(LocalDateTime.now());
        resume.setActive(true);
        
        // Save resume first
        Resume savedResume = resumeRepository.save(resume);
        System.out.println("ResumeService: Resume saved with ID " + savedResume.getId());
        
        // Perform ATS analysis asynchronously (in background)
        try {
            System.out.println("ResumeService: Starting ATS analysis...");
            Resume.ATSAnalysis atsAnalysis = geminiAIService.analyzeResumeATS(extractedText, fileName);
            
            savedResume.setAtsAnalysis(atsAnalysis);
            savedResume = resumeRepository.save(savedResume);
            
            System.out.println("ResumeService: ATS analysis completed and saved");
        } catch (Exception e) {
            System.err.println("ResumeService: ATS analysis failed: " + e.getMessage());
            // Continue without ATS analysis - it can be retried later
        }
        
        return savedResume;
    }
    
    public List<Resume> getUserResumes(String userId) {
        return resumeRepository.findByUserId(userId);
    }
    
    public Resume getResumeById(String resumeId) {
        Optional<Resume> resume = resumeRepository.findById(resumeId);
        return resume.orElse(null);
    }
    
    public Resume getCurrentResume(String userId) {
        return resumeRepository.findByUserIdAndIsActiveTrueOrderByUploadedAtDesc(userId)
                .orElse(null);
    }
    
    public Resume getResume(String id) {
        return resumeRepository.findById(id).orElse(null);
    }
    
    public byte[] downloadResume(String id) throws IOException {
        Resume resume = resumeRepository.findById(id).orElse(null);
        if (resume == null) {
            throw new IllegalArgumentException("Resume not found");
        }
        
        Path filePath = Paths.get(resume.getFilePath());
        if (!Files.exists(filePath)) {
            throw new IOException("File not found on disk");
        }
        
        return Files.readAllBytes(filePath);
    }
    
    public void activateResume(String id, String userId) {
        Resume resume = resumeRepository.findById(id).orElse(null);
        if (resume == null || !resume.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Resume not found or unauthorized");
        }
        
        // Deactivate other resumes
        List<Resume> existingResumes = resumeRepository.findByUserIdAndIsActiveTrue(userId);
        existingResumes.forEach(r -> {
            r.setActive(false);
            resumeRepository.save(r);
        });
        
        // Activate this resume
        resume.setActive(true);
        resumeRepository.save(resume);
    }
    
    public void deleteResume(String id, String userId) throws IOException {
        Resume resume = resumeRepository.findById(id).orElse(null);
        if (resume == null || !resume.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Resume not found or unauthorized");
        }
        
        // Delete file from disk
        Path filePath = Paths.get(resume.getFilePath());
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
        
        // Delete from database
        resumeRepository.deleteById(id);
    }
    
    public Resume updateResume(String id, Resume resumeData, String userId) {
        Resume resume = resumeRepository.findById(id).orElse(null);
        if (resume == null || !resume.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Resume not found or unauthorized");
        }
        
        // Update only editable fields
        resume.setSkills(resumeData.getSkills());
        resume.setExperiences(resumeData.getExperiences());
        resume.setEducations(resumeData.getEducations());
        resume.setCertifications(resumeData.getCertifications());
        resume.setSummary(resumeData.getSummary());
        resume.setContactInfo(resumeData.getContactInfo());
        
        return resumeRepository.save(resume);
    }
    
    public Resume renameResume(String id, String newFileName, String userId) {
        Resume resume = resumeRepository.findById(id).orElse(null);
        if (resume == null || !resume.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Resume not found or unauthorized");
        }
        
        resume.setFileName(newFileName);
        return resumeRepository.save(resume);
    }
    
    public Resume triggerATSAnalysis(String resumeId, String userId) {
        Optional<Resume> resumeOpt = resumeRepository.findById(resumeId);
        if (resumeOpt.isEmpty()) {
            throw new IllegalArgumentException("Resume not found");
        }
        
        Resume resume = resumeOpt.get();
        if (!resume.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized access to resume");
        }
        
        if (resume.getExtractedText() == null || resume.getExtractedText().trim().isEmpty()) {
            throw new IllegalArgumentException("No text content available for analysis");
        }
        
        System.out.println("ResumeService: Triggering ATS analysis for resume " + resumeId);
        Resume.ATSAnalysis atsAnalysis = geminiAIService.analyzeResumeATS(resume.getExtractedText(), resume.getFileName());
        
        resume.setAtsAnalysis(atsAnalysis);
        return resumeRepository.save(resume);
    }
    
    // Management functionality
    public List<Resume> getAllStudentResumes() {
        return resumeRepository.findAll();
    }
    
    public List<Resume> getResumesWithATSAnalysis() {
        return resumeRepository.findResumesWithATSAnalysis();
    }
    
    public String analyzeStudentProfiles(String query) {
        List<Resume> allResumes = resumeRepository.findAll();
        return geminiAIService.analyzeStudentProfiles(query, allResumes);
    }
    
    public Resume markResumeAsSentToManagement(String resumeId) {
        Optional<Resume> resumeOpt = resumeRepository.findById(resumeId);
        if (resumeOpt.isEmpty()) {
            throw new IllegalArgumentException("Resume not found");
        }
        
        Resume resume = resumeOpt.get();
        resume.setSentToManagement(true);
        resume.setSentToManagementAt(LocalDateTime.now());
        
        return resumeRepository.save(resume);
    }
    
    private String extractTextFromFile(MultipartFile file, String fileExtension) throws IOException {
        System.out.println("ResumeService: Extracting text from " + fileExtension + " file");
        
        try {
            switch (fileExtension.toLowerCase()) {
                case ".pdf":
                    return extractTextFromPDF(file);
                case ".doc":
                    return extractTextFromDOC(file);
                case ".docx":
                    return extractTextFromDOCX(file);
                default:
                    throw new IllegalArgumentException("Unsupported file format: " + fileExtension);
            }
        } catch (Exception e) {
            System.err.println("ResumeService: Error extracting text: " + e.getMessage());
            throw new IOException("Failed to extract text from file", e);
        }
    }
    
    private String extractTextFromPDF(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            System.out.println("ResumeService: Extracted " + text.length() + " characters from PDF");
            return text;
        }
    }
    
    private String extractTextFromDOC(MultipartFile file) throws IOException {
        try (HWPFDocument document = new HWPFDocument(file.getInputStream())) {
            WordExtractor extractor = new WordExtractor(document);
            String text = extractor.getText();
            extractor.close();
            System.out.println("ResumeService: Extracted " + text.length() + " characters from DOC");
            return text;
        }
    }
    
    private String extractTextFromDOCX(MultipartFile file) throws IOException {
        try (XWPFDocument document = new XWPFDocument(file.getInputStream())) {
            StringBuilder text = new StringBuilder();
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                text.append(paragraph.getText()).append("\n");
            }
            String result = text.toString();
            System.out.println("ResumeService: Extracted " + result.length() + " characters from DOCX");
            return result;
        }
    }
    
    private boolean isValidFileType(String fileType) {
        return fileType != null && (
                fileType.equals("application/pdf") ||
                fileType.equals("application/msword") ||
                fileType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        );
    }
    
    private String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < fileName.length() - 1) {
            return fileName.substring(lastDotIndex);
        }
        return "";
    }
}
