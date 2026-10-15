package com.jobportal.backend.controller;

import com.jobportal.backend.dto.response.MessageResponse;
import com.jobportal.backend.model.SavedJob;
import com.jobportal.backend.service.SavedJobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saved-jobs")
@Tag(name = "Saved Jobs", description = "Bookmark and manage saved job listings")
public class SavedJobController {

    @Autowired
    private SavedJobService savedJobService;

    @PostMapping("/{jobId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Bookmark/save a job")
    public ResponseEntity<SavedJob> saveJob(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long jobId
    ) {
        SavedJob saved = savedJobService.saveJob(userDetails.getUsername(), jobId);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Remove a job from saved jobs")
    public ResponseEntity<MessageResponse> unsaveJob(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long jobId
    ) {
        savedJobService.unsaveJob(userDetails.getUsername(), jobId);
        return ResponseEntity.ok(new MessageResponse("Job removed from saved bookmarks."));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get all saved jobs for current user")
    public ResponseEntity<List<SavedJob>> getSavedJobs(@AuthenticationPrincipal UserDetails userDetails) {
        List<SavedJob> list = savedJobService.getSavedJobs(userDetails.getUsername());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/check/{jobId}")
    @Operation(summary = "Check if a job is saved by current user")
    public ResponseEntity<Map<String, Boolean>> checkIsSaved(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long jobId
    ) {
        if (userDetails == null) {
            return ResponseEntity.ok(Map.of("isSaved", false));
        }
        boolean isSaved = savedJobService.isJobSaved(userDetails.getUsername(), jobId);
        return ResponseEntity.ok(Map.of("isSaved", isSaved));
    }
}
