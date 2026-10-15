package com.jobportal.backend.controller;

import com.jobportal.backend.dto.request.CandidateProfileRequest;
import com.jobportal.backend.model.CandidateProfile;
import com.jobportal.backend.service.CandidateProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Candidate Profile", description = "Candidate resume, skills, education, and profile management")
public class ProfileController {

    @Autowired
    private CandidateProfileService profileService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get profile of currently authenticated user")
    public ResponseEntity<CandidateProfile> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        CandidateProfile profile = profileService.getOrCreateProfile(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update profile details (headline, skills, experience, education)")
    public ResponseEntity<CandidateProfile> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CandidateProfileRequest request
    ) {
        CandidateProfile updated = profileService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload candidate resume PDF document")
    public ResponseEntity<CandidateProfile> uploadResume(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        CandidateProfile updated = profileService.uploadResume(userDetails.getUsername(), file);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/resume/{userId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Download or stream candidate resume file")
    public ResponseEntity<Resource> downloadResume(@PathVariable Long userId) throws IOException {
        Path path = profileService.getResumeFilePath(userId);
        Resource resource = new UrlResource(path.toUri());

        String filename = path.getFileName().toString();
        MediaType contentType = MediaType.APPLICATION_PDF;
        if (filename.endsWith(".docx")) {
            contentType = MediaType.valueOf("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        }

        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
