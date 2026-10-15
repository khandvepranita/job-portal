package com.jobportal.backend.controller;

import com.jobportal.backend.dto.request.ATSCheckRequest;
import com.jobportal.backend.dto.response.ATSAnalysisResponse;
import com.jobportal.backend.exception.ResourceNotFoundException;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.service.ATSScoringService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats")
@Tag(name = "ATS Resume Matcher", description = "AI-powered resume & job skill compatibility analyzer")
public class ATSController {

    @Autowired
    private ATSScoringService atsScoringService;

    @Autowired
    private JobRepository jobRepository;

    @PostMapping("/analyze")
    @Operation(summary = "Analyze candidate profile/skills against a job posting")
    public ResponseEntity<ATSAnalysisResponse> analyzeMatch(@RequestBody ATSCheckRequest request) {
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + request.getJobId()));

        ATSAnalysisResponse result = atsScoringService.analyzeMatch(job, request);
        return ResponseEntity.ok(result);
    }
}
