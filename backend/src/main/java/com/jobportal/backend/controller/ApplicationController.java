package com.jobportal.backend.controller;

import com.jobportal.backend.dto.request.ApplicationRequest;
import com.jobportal.backend.dto.request.ApplicationStatusUpdateRequest;
import com.jobportal.backend.dto.response.ApplicationResponse;
import com.jobportal.backend.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Application Tracking System (ATS)", description = "Job application lifecycle, applicant submission, and status management")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping(consumes = { MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE })
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Apply for a job with optional resume file attachment")
    public ResponseEntity<ApplicationResponse> apply(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("application") @Valid ApplicationRequest request,
            @RequestPart(value = "resumeFile", required = false) MultipartFile resumeFile
    ) {
        ApplicationResponse response = applicationService.applyToJob(userDetails.getUsername(), request, resumeFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/quick-apply")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Quick apply using existing profile data")
    public ResponseEntity<ApplicationResponse> quickApply(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ApplicationRequest request
    ) {
        ApplicationResponse response = applicationService.applyToJob(userDetails.getUsername(), request, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get list of positions applied to by current user")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<ApplicationResponse> list = applicationService.getUserApplications(userDetails.getUsername());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Get all candidate applications for a specific job (Recruiter view)")
    public ResponseEntity<List<ApplicationResponse>> getJobApplications(@PathVariable Long jobId) {
        List<ApplicationResponse> list = applicationService.getJobApplications(jobId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get single application details")
    public ResponseEntity<ApplicationResponse> getApplicationById(@PathVariable Long id) {
        ApplicationResponse response = applicationService.getApplicationById(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Update application status and recruiter notes in ATS pipeline")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationStatusUpdateRequest request
    ) {
        ApplicationResponse updated = applicationService.updateApplicationStatus(id, request);
        return ResponseEntity.ok(updated);
    }
}
