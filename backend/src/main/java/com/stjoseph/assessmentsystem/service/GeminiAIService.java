package com.stjoseph.assessmentsystem.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stjoseph.assessmentsystem.model.Resume;

@Service
public class GeminiAIService {
    
    @Value("${app.ai.gemini.api-key}")
    private String geminiApiKey;
    
    @Value("${app.ai.gemini.url}")
    private String geminiUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public Resume.ATSAnalysis analyzeResumeATS(String resumeText, String fileName) {
        try {
            System.out.println("GeminiAIService: Starting ATS analysis for " + fileName);
            System.out.println("GeminiAIService: Resume text length: " + resumeText.length() + " characters");
            
            String prompt = buildATSAnalysisPrompt(resumeText);
            System.out.println("GeminiAIService: Calling Gemini API with enhanced prompt...");
            String aiResponse = callGeminiAPI(prompt);
            
            System.out.println("GeminiAIService: Received AI response, parsing...");
            System.out.println("GeminiAIService: Raw AI response (first 500 chars): " + 
                (aiResponse.length() > 500 ? aiResponse.substring(0, 500) + "..." : aiResponse));
            
            Resume.ATSAnalysis analysis = parseATSResponse(aiResponse);
            analysis.setAnalyzedAt(LocalDateTime.now());
            
            System.out.println("GeminiAIService: ATS analysis completed successfully!");
            System.out.println("GeminiAIService: Overall Score: " + analysis.getOverallScore());
            System.out.println("GeminiAIService: Skills Score: " + analysis.getSkillsScore());
            System.out.println("GeminiAIService: Experience Score: " + analysis.getExperienceScore());
            
            return analysis;
            
        } catch (Exception e) {
            System.err.println("GeminiAIService: Error during ATS analysis: " + e.getMessage());
            e.printStackTrace();
            
            System.err.println("GeminiAIService: Using fallback analysis due to error");
            
            // Return a default analysis in case of error
            Resume.ATSAnalysis fallbackAnalysis = new Resume.ATSAnalysis();
            fallbackAnalysis.setDetailedSummary("Analysis failed due to technical error. Please try again later.");
            fallbackAnalysis.setOverallScore(50);
            fallbackAnalysis.setSkillsScore(50);
            fallbackAnalysis.setFormattingScore(50);
            fallbackAnalysis.setKeywordsScore(50);
            fallbackAnalysis.setExperienceScore(50);
            fallbackAnalysis.setEducationScore(50);
            fallbackAnalysis.setFeedback(Arrays.asList("Analysis failed - please try again"));
            fallbackAnalysis.setRecommendations(Arrays.asList("Please resubmit for analysis"));
            fallbackAnalysis.setStrengths(new ArrayList<>());
            fallbackAnalysis.setWeaknesses(Arrays.asList("Unable to analyze due to technical error"));
            fallbackAnalysis.setMissingKeywords(new ArrayList<>());
            fallbackAnalysis.setAnalyzedAt(LocalDateTime.now());
            
            return fallbackAnalysis;
        }
    }
    
    public String analyzeStudentProfiles(String query, List<Resume> studentResumes) {
        try {
            System.out.println("GeminiAIService: Analyzing student profiles with query: " + query);
            
            // Check if there are any resumes with ATS analysis
            List<Resume> resumesWithAnalysis = studentResumes.stream()
                .filter(resume -> resume.getAtsAnalysis() != null)
                .toList();
            
            if (resumesWithAnalysis.isEmpty()) {
                System.out.println("GeminiAIService: No student resumes with ATS analysis found");
                return "No student data available for analysis. Students need to upload and analyze their resumes first before management can get insights.";
            }
            
            String prompt = buildStudentAnalysisPrompt(query, resumesWithAnalysis);
            String aiResponse = callGeminiAPI(prompt);
            
            System.out.println("GeminiAIService: Student profile analysis completed");
            return aiResponse;
            
        } catch (Exception e) {
            System.err.println("GeminiAIService: Error during student profile analysis: " + e.getMessage());
            return "I apologize, but I encountered an error while analyzing the student profiles. Please try again with a different query.";
        }
    }
    
    private String buildATSAnalysisPrompt(String resumeText) {
        return """
            As an expert ATS (Applicant Tracking System) analyzer, please analyze the following resume and provide a comprehensive assessment. Be very specific and vary your scores based on the actual content quality.
            
            Resume Content:
            %s
            
            IMPORTANT SCORING GUIDELINES:
            - Analyze the ACTUAL content quality, don't give generic scores
            - Use the full range 0-100, be critical and realistic
            - Different resumes should get different scores based on their actual strengths/weaknesses
            - A student resume might score 60-75, while an experienced professional might score 80-90
            - Poor formatting or missing sections should significantly lower scores
            - Strong technical skills and relevant experience should increase scores
            
            Please provide your analysis in the following JSON format (respond ONLY with valid JSON):
            {
                "detailedSummary": "<A comprehensive 2-3 paragraph analysis of the resume content, including background, experience, skills, education, and overall profile assessment>",
                "overallScore": <number 0-100 based on overall ATS compatibility>,
                "skillsScore": <number 0-100 based on technical/soft skills quality and relevance>,
                "formattingScore": <number 0-100 based on ATS-friendly formatting and structure>,
                "keywordsScore": <number 0-100 based on industry keywords and buzzwords>,
                "experienceScore": <number 0-100 based on work experience quality and relevance>,
                "educationScore": <number 0-100 based on educational background strength>,
                "feedback": [
                    "<specific feedback point 1>",
                    "<specific feedback point 2>",
                    "<specific feedback point 3>"
                ],
                "recommendations": [
                    "<actionable recommendation 1>",
                    "<actionable recommendation 2>",
                    "<actionable recommendation 3>"
                ],
                "strengths": [
                    "<specific strength 1>",
                    "<specific strength 2>",
                    "<specific strength 3>"
                ],
                "weaknesses": [
                    "<specific weakness 1>",
                    "<specific weakness 2>",
                    "<specific weakness 3>"
                ],
                "missingKeywords": [
                    "<missing keyword 1>",
                    "<missing keyword 2>",
                    "<missing keyword 3>"
                ]
            }
            
            Detailed Summary Guidelines:
            - Start with the candidate's professional background and current status
            - Highlight key experiences, projects, and achievements
            - Discuss technical and soft skills demonstrated
            - Comment on educational background and certifications
            - Provide an overall assessment of the candidate's profile strength
            - Make it comprehensive but concise (2-3 well-structured paragraphs)
            
            Specific Scoring Criteria:
            - Overall Score (0-100): Comprehensive ATS compatibility - be realistic about actual resume quality
            - Skills Score (0-100): Technical and soft skills - low if basic/missing, high if extensive/relevant
            - Formatting Score (0-100): ATS-friendly structure - penalize poor formatting heavily
            - Keywords Score (0-100): Industry-relevant terms - low if generic, high if specific technical terms
            - Experience Score (0-100): Work experience quality - students typically 40-65, professionals 70-95
            - Education Score (0-100): Educational background - evaluate based on relevance and achievements
            
            Remember: Use realistic, varied scores based on actual content quality. Don't give similar scores to different resumes.
            """.formatted(resumeText);
    }
    
    private String buildStudentAnalysisPrompt(String query, List<Resume> studentResumes) {
        StringBuilder resumeData = new StringBuilder();
        
        for (int i = 0; i < studentResumes.size(); i++) {
            Resume resume = studentResumes.get(i);
            resumeData.append("Student ").append(i + 1).append(":\n");
            resumeData.append("Name: ").append(resume.getFileName()).append("\n");
            
            if (resume.getSkills() != null && !resume.getSkills().isEmpty()) {
                resumeData.append("Skills: ").append(String.join(", ", resume.getSkills())).append("\n");
            }
            
            if (resume.getAtsAnalysis() != null) {
                resumeData.append("ATS Score: ").append(resume.getAtsAnalysis().getOverallScore()).append("/100\n");
                if (resume.getAtsAnalysis().getStrengths() != null && !resume.getAtsAnalysis().getStrengths().isEmpty()) {
                    resumeData.append("Strengths: ").append(String.join(", ", resume.getAtsAnalysis().getStrengths())).append("\n");
                }
            }
            
            if (resume.getSummary() != null && !resume.getSummary().isEmpty()) {
                resumeData.append("Summary: ").append(resume.getSummary()).append("\n");
            }
            
            if (resume.getExperiences() != null && !resume.getExperiences().isEmpty()) {
                resumeData.append("Experience: ");
                for (Resume.Experience exp : resume.getExperiences()) {
                    resumeData.append(exp.getPosition()).append(" at ").append(exp.getCompany()).append("; ");
                }
                resumeData.append("\n");
            }
            
            resumeData.append("\n");
        }
        
        return """
            As an expert HR analyst, please analyze the following student profiles and answer this query: "%s"
            
            Student Data:
            %s
            
            Please provide a comprehensive analysis that includes:
            1. Direct answer to the query
            2. Ranked recommendations with specific student details
            3. Reasoning for your recommendations
            4. Additional insights about the student profiles
            
            Format your response clearly with student names and specific details that support your analysis.
            """.formatted(query, resumeData.toString());
    }
    
    private String callGeminiAPI(String prompt) throws Exception {
        System.out.println("GeminiAIService: Calling Gemini API...");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            ),
            "generationConfig", Map.of(
                "temperature", 0.7,
                "topK", 40,
                "topP", 0.95,
                "maxOutputTokens", 2048
            )
        );
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        String url = geminiUrl + "?key=" + geminiApiKey;
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
        
        if (response.getStatusCode().is2xxSuccessful()) {
            System.out.println("GeminiAIService: API call successful");
            return extractTextFromGeminiResponse(response.getBody());
        } else {
            throw new RuntimeException("Gemini API call failed with status: " + response.getStatusCode());
        }
    }
    
    private String extractTextFromGeminiResponse(String responseBody) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(responseBody);
        
        if (root.has("candidates") && root.get("candidates").isArray() && root.get("candidates").size() > 0) {
            JsonNode candidate = root.get("candidates").get(0);
            if (candidate.has("content") && candidate.get("content").has("parts") && 
                candidate.get("content").get("parts").isArray() && 
                candidate.get("content").get("parts").size() > 0) {
                
                JsonNode part = candidate.get("content").get("parts").get(0);
                if (part.has("text")) {
                    return part.get("text").asText();
                }
            }
        }
        
        throw new RuntimeException("Unable to extract text from Gemini response");
    }
    
    private Resume.ATSAnalysis parseATSResponse(String aiResponse) {
        try {
            // Clean the response - remove markdown code blocks if present
            String cleanResponse = aiResponse.trim();
            if (cleanResponse.startsWith("```json")) {
                cleanResponse = cleanResponse.substring(7);
            }
            if (cleanResponse.startsWith("```")) {
                cleanResponse = cleanResponse.substring(3);
            }
            if (cleanResponse.endsWith("```")) {
                cleanResponse = cleanResponse.substring(0, cleanResponse.length() - 3);
            }
            cleanResponse = cleanResponse.trim();
            
            JsonNode root = objectMapper.readTree(cleanResponse);
            
            Resume.ATSAnalysis analysis = new Resume.ATSAnalysis();
            analysis.setDetailedSummary(root.get("detailedSummary").asText());
            analysis.setOverallScore(root.get("overallScore").asInt());
            analysis.setSkillsScore(root.get("skillsScore").asInt());
            analysis.setFormattingScore(root.get("formattingScore").asInt());
            analysis.setKeywordsScore(root.get("keywordsScore").asInt());
            analysis.setExperienceScore(root.get("experienceScore").asInt());
            analysis.setEducationScore(root.get("educationScore").asInt());
            
            analysis.setFeedback(jsonArrayToList(root.get("feedback")));
            analysis.setRecommendations(jsonArrayToList(root.get("recommendations")));
            analysis.setStrengths(jsonArrayToList(root.get("strengths")));
            analysis.setWeaknesses(jsonArrayToList(root.get("weaknesses")));
            analysis.setMissingKeywords(jsonArrayToList(root.get("missingKeywords")));
            
            return analysis;
            
        } catch (Exception e) {
            System.err.println("GeminiAIService: Error parsing ATS response: " + e.getMessage());
            throw new RuntimeException("Failed to parse ATS analysis response", e);
        }
    }
    
    private List<String> jsonArrayToList(JsonNode arrayNode) {
        List<String> list = new ArrayList<>();
        if (arrayNode != null && arrayNode.isArray()) {
            for (JsonNode item : arrayNode) {
                list.add(item.asText());
            }
        }
        return list;
    }
}
