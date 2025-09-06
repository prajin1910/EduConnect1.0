package com.stjoseph.assessmentsystem.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stjoseph.assessmentsystem.dto.AIAssessmentRequest;
import com.stjoseph.assessmentsystem.dto.ChatRequest;
import com.stjoseph.assessmentsystem.dto.RoadmapRequest;
import com.stjoseph.assessmentsystem.model.Assessment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIService {
    
    @Value("${app.ai.gemini.api-key}")
    private String apiKey;
    
    @Value("${app.ai.gemini.url}")
    private String apiUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public Assessment generateAssessment(AIAssessmentRequest request) {
        try {
            String prompt = String.format(
                "Generate %d multiple choice questions for %s domain at %s difficulty level. " +
                "Return ONLY a JSON object with 'questions' array. Each question should have: " +
                "'question' (string), 'options' (array of 4 strings), 'correctAnswer' (0-based index), " +
                "'explanation' (string explaining why the answer is correct). " +
                "Make questions relevant and educational.",
                request.getNumberOfQuestions(),
                request.getDomain(),
                request.getDifficulty()
            );
            
            String response = callGeminiAPI(prompt);
            return parseAssessmentResponse(response, request);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate assessment: " + e.getMessage());
        }
    }
    
    public String generateChatResponse(ChatRequest request) {
        try {
            String prompt = request.getMessage() + 
                          "\n\nPlease provide a helpful and educational response suitable for a student.";
            return callGeminiAPI(prompt);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate chat response: " + e.getMessage());
        }
    }
    
    public List<String> generateRoadmap(RoadmapRequest request) {
        try {
            String prompt = String.format(
                "Create a detailed roadmap for completing this task:\n" +
                "Task: %s\n" +
                "Description: %s\n" +
                "Due Date: %s\n\n" +
                "Break it down into specific, actionable steps with timeline. " +
                "Return as a JSON array of strings, each representing a step.",
                request.getTaskName(),
                request.getDescription(),
                request.getDueDate().toString()
            );
            
            String response = callGeminiAPI(prompt);
            return parseRoadmapResponse(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate roadmap: " + e.getMessage());
        }
    }
    
    private String callGeminiAPI(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("X-goog-api-key", apiKey);
            
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            Map<String, String> part = new HashMap<>();
            part.put("text", prompt);
            
            content.put("parts", new Object[]{part});
            requestBody.put("contents", new Object[]{content});
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl, HttpMethod.POST, entity, String.class);
            
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            return jsonNode.get("candidates").get(0)
                          .get("content").get("parts").get(0)
                          .get("text").asText();
        } catch (Exception e) {
            throw new RuntimeException("API call failed: " + e.getMessage());
        }
    }
    
    private Assessment parseAssessmentResponse(String response, AIAssessmentRequest request) {
        try {
            // Extract JSON from response if it's wrapped in markdown
            String jsonStr = response;
            if (response.contains("```json")) {
                jsonStr = response.substring(response.indexOf("```json") + 7);
                jsonStr = jsonStr.substring(0, jsonStr.indexOf("```"));
            }
            
            JsonNode jsonNode = objectMapper.readTree(jsonStr);
            JsonNode questionsNode = jsonNode.get("questions");
            
            Assessment assessment = new Assessment();
            assessment.setTitle(request.getDomain() + " Assessment");
            assessment.setDescription("AI Generated " + request.getDifficulty() + " level assessment");
            assessment.setType(Assessment.AssessmentType.AI_GENERATED);
            assessment.setDomain(request.getDomain());
            assessment.setDifficulty(request.getDifficulty());
            assessment.setTotalMarks(request.getNumberOfQuestions());
            assessment.setDuration(request.getNumberOfQuestions() * 2); // 2 minutes per question
            
            List<Assessment.Question> questions = new ArrayList<>();
            
            for (JsonNode questionNode : questionsNode) {
                Assessment.Question question = new Assessment.Question();
                question.setQuestion(questionNode.get("question").asText());
                
                List<String> options = new ArrayList<>();
                JsonNode optionsNode = questionNode.get("options");
                for (JsonNode option : optionsNode) {
                    options.add(option.asText());
                }
                question.setOptions(options);
                question.setCorrectAnswer(questionNode.get("correctAnswer").asInt());
                question.setExplanation(questionNode.get("explanation").asText());
                
                questions.add(question);
            }
            
            assessment.setQuestions(questions);
            return assessment;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse assessment response: " + e.getMessage());
        }
    }
    
    private List<String> parseRoadmapResponse(String response) {
        try {
            String jsonStr = response;
            if (response.contains("```json")) {
                jsonStr = response.substring(response.indexOf("```json") + 7);
                jsonStr = jsonStr.substring(0, jsonStr.indexOf("```"));
            }
            
            JsonNode jsonNode = objectMapper.readTree(jsonStr);
            List<String> roadmap = new ArrayList<>();
            
            if (jsonNode.isArray()) {
                for (JsonNode step : jsonNode) {
                    roadmap.add(step.asText());
                }
            } else {
                // If not an array, try to extract text and split by lines
                String text = jsonNode.asText();
                String[] steps = text.split("\n");
                for (String step : steps) {
                    if (step.trim().length() > 0) {
                        roadmap.add(step.trim());
                    }
                }
            }
            
            return roadmap;
        } catch (Exception e) {
            // Fallback: split by lines
            List<String> roadmap = new ArrayList<>();
            String[] lines = response.split("\n");
            for (String line : lines) {
                if (line.trim().length() > 0 && !line.trim().startsWith("```")) {
                    roadmap.add(line.trim());
                }
            }
            return roadmap;
        }
    }
}