package com.jobportal.backend.service;

import com.jobportal.backend.dto.request.JobRequest;
import com.jobportal.backend.exception.ResourceNotFoundException;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.Status;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.service.impl.JobServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private JobServiceImpl jobService;

    private Job sampleJob;
    private JobRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleJob = new Job("Backend Engineer", "TechCorp", "Remote", "Full-time", "Build microservices", "$120,000");
        sampleJob.setId(1L);
        sampleJob.setStatus(Status.ACTIVE);

        sampleRequest = new JobRequest();
        sampleRequest.setTitle("Backend Engineer");
        sampleRequest.setCompany("TechCorp");
        sampleRequest.setLocation("Remote");
        sampleRequest.setType("Full-time");
        sampleRequest.setDescription("Build microservices");
        sampleRequest.setSalary("$120,000");
    }

    @Test
    @DisplayName("Should create job with active status")
    void shouldCreateJob() {
        when(jobRepository.save(any(Job.class))).thenReturn(sampleJob);

        Job created = jobService.createJob(sampleRequest);

        assertNotNull(created);
        assertEquals("Backend Engineer", created.getTitle());
        assertEquals(Status.ACTIVE, created.getStatus());
        verify(jobRepository, times(1)).save(any(Job.class));
    }

    @Test
    @DisplayName("Should return job when valid id provided")
    void shouldReturnJobById() {
        when(jobRepository.findByIdAndStatus(1L, Status.ACTIVE)).thenReturn(Optional.of(sampleJob));

        Job found = jobService.getJobById(1L);

        assertNotNull(found);
        assertEquals(1L, found.getId());
        assertEquals("TechCorp", found.getCompany());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when job not found")
    void shouldThrowExceptionWhenJobNotFound() {
        when(jobRepository.findByIdAndStatus(99L, Status.ACTIVE)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> jobService.getJobById(99L));
    }

    @Test
    @DisplayName("Should soft delete job by updating status to INACTIVE")
    void shouldSoftDeleteJob() {
        when(jobRepository.findByIdAndStatus(1L, Status.ACTIVE)).thenReturn(Optional.of(sampleJob));
        when(jobRepository.save(any(Job.class))).thenReturn(sampleJob);

        jobService.deleteJob(1L);

        assertEquals(Status.INACTIVE, sampleJob.getStatus());
        verify(jobRepository, times(1)).save(sampleJob);
    }
}
