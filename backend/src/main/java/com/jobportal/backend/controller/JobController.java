package com.jobportal.backend.controller;

import com.jobportal.backend.dto.request.JobRequest;
import com.jobportal.backend.dto.response.MessageResponse;
import com.jobportal.backend.dto.response.PagedResponse;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@Tag(name = "Job Management", description = "CRUD operations for Jobs with RBAC Method Security")
public class JobController {

    @Autowired
    private JobService jobService;

    @GetMapping
    @Operation(summary = "Get paginated, sorted, and filtered jobs list")
    public ResponseEntity<PagedResponse<Job>> getAllJobs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir,
            @RequestParam(value = "search", required = false) String search
    ) {
        PagedResponse<Job> jobs = jobService.getAllJobs(page, size, sortBy, sortDir, search);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get job details by ID")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        Job job = jobService.getJobById(id);
        return ResponseEntity.ok(job);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Create new job (Requires ADMIN or MANAGER role)")
    public ResponseEntity<Job> createJob(@Valid @RequestBody JobRequest jobRequest) {
        Job createdJob = jobService.createJob(jobRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Update job (Requires ADMIN or MANAGER role)")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @Valid @RequestBody JobRequest jobRequest) {
        Job updatedJob = jobService.updateJob(id, jobRequest);
        return ResponseEntity.ok(updatedJob);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft delete job (Requires ADMIN role)")
    public ResponseEntity<MessageResponse> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(new MessageResponse("Job soft-deleted successfully (status set to INACTIVE)."));
    }
}
