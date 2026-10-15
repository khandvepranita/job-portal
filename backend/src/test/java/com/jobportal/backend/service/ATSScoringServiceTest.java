package com.jobportal.backend.service;

import com.jobportal.backend.dto.request.ATSCheckRequest;
import com.jobportal.backend.dto.response.ATSAnalysisResponse;
import com.jobportal.backend.model.Job;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ATSScoringServiceTest {

    private ATSScoringService atsScoringService;

    @BeforeEach
    void setUp() {
        atsScoringService = new ATSScoringService();
    }

    @Test
    @DisplayName("Should calculate high match score when candidate skills align with job description")
    void shouldCalculateHighMatchScoreForMatchingSkills() {
        Job job = new Job();
        job.setTitle("Senior Java & Spring Boot Developer");
        job.setDescription("Looking for expertise in Java, Spring Boot, MySQL, Docker, and REST APIs.");

        ATSCheckRequest request = new ATSCheckRequest();
        request.setCandidateSkills("Java, Spring Boot, MySQL, Docker, REST, Git");
        request.setCandidateSummary("4 years experience developing backend microservices with Java and Spring Boot.");

        ATSAnalysisResponse response = atsScoringService.analyzeMatch(job, request);

        assertNotNull(response);
        assertTrue(response.getMatchScore() >= 80, "Expected high match score >= 80, got " + response.getMatchScore());
        assertTrue(response.getMatchedSkills().stream().anyMatch(s -> s.equalsIgnoreCase("Java")));
        assertTrue(response.getMatchedSkills().stream().anyMatch(s -> s.equalsIgnoreCase("Spring Boot")));
    }

    @Test
    @DisplayName("Should identify missing skills and provide actionable recommendations")
    void shouldIdentifyMissingSkills() {
        Job job = new Job();
        job.setTitle("DevOps Specialist");
        job.setDescription("Must know Kubernetes, Docker, AWS, and Linux.");

        ATSCheckRequest request = new ATSCheckRequest();
        request.setCandidateSkills("HTML, CSS, JavaScript");

        ATSAnalysisResponse response = atsScoringService.analyzeMatch(job, request);

        assertNotNull(response);
        assertFalse(response.getMissingSkills().isEmpty(), "Expected missing skills to be populated");
        assertNotNull(response.getSuggestions());
        assertFalse(response.getSuggestions().isEmpty());
    }
}
