package com.jobportal.backend.service;

import com.jobportal.backend.dto.request.ATSCheckRequest;
import com.jobportal.backend.dto.request.ApplicationRequest;
import com.jobportal.backend.dto.request.ApplicationStatusUpdateRequest;
import com.jobportal.backend.dto.response.ATSAnalysisResponse;
import com.jobportal.backend.dto.response.ApplicationResponse;
import com.jobportal.backend.exception.BadRequestException;
import com.jobportal.backend.model.*;
import com.jobportal.backend.repository.CandidateProfileRepository;
import com.jobportal.backend.repository.JobApplicationRepository;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private JobApplicationRepository applicationRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CandidateProfileRepository profileRepository;

    @Mock
    private CandidateProfileService profileService;

    @Mock
    private ATSScoringService atsScoringService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ApplicationService applicationService;

    private User sampleUser;
    private Job sampleJob;
    private JobApplication sampleApplication;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Alex Morgan", "user@jobportal.com", "Password123", Role.ROLE_USER);
        sampleUser.setId(10L);

        sampleJob = new Job("Senior Java Developer", "TechCorp", "Remote", "Full-time", "Spring Boot microservices", "$120,000");
        sampleJob.setId(20L);
        sampleJob.setStatus(Status.ACTIVE);

        sampleApplication = new JobApplication(sampleUser, sampleJob, "Cover letter", "resume.pdf", "/uploads/resume.pdf");
        sampleApplication.setId(100L);
    }

    @Test
    @DisplayName("Should successfully submit job application and compute ATS score")
    void shouldSubmitJobApplication() {
        ApplicationRequest request = new ApplicationRequest(20L, "Cover letter text", "resume.pdf");

        when(userRepository.findByEmail("user@jobportal.com")).thenReturn(Optional.of(sampleUser));
        when(jobRepository.findById(20L)).thenReturn(Optional.of(sampleJob));
        when(applicationRepository.existsByUserIdAndJobId(10L, 20L)).thenReturn(false);
        when(profileRepository.findByUserId(10L)).thenReturn(Optional.empty());

        ATSAnalysisResponse atsResponse = new ATSAnalysisResponse(88, "Strong Fit", List.of("Java"), List.of("Docker"), List.of("Add Docker"), "88% match");
        when(atsScoringService.analyzeMatch(any(Job.class), any(ATSCheckRequest.class))).thenReturn(atsResponse);
        when(applicationRepository.save(any(JobApplication.class))).thenReturn(sampleApplication);

        ApplicationResponse result = applicationService.applyToJob("user@jobportal.com", request, null);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        verify(applicationRepository, times(1)).save(any(JobApplication.class));
        verify(notificationService, times(1)).createNotification(eq(sampleUser), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should reject duplicate job application for the same job and user")
    void shouldRejectDuplicateApplication() {
        ApplicationRequest request = new ApplicationRequest(20L, "Cover letter", "resume.pdf");

        when(userRepository.findByEmail("user@jobportal.com")).thenReturn(Optional.of(sampleUser));
        when(jobRepository.findById(20L)).thenReturn(Optional.of(sampleJob));
        when(applicationRepository.existsByUserIdAndJobId(10L, 20L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> applicationService.applyToJob("user@jobportal.com", request, null));
        verify(applicationRepository, never()).save(any(JobApplication.class));
    }

    @Test
    @DisplayName("Should update application status and notify candidate")
    void shouldUpdateApplicationStatus() {
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(sampleApplication));
        when(applicationRepository.save(any(JobApplication.class))).thenReturn(sampleApplication);

        ApplicationStatusUpdateRequest updateReq = new ApplicationStatusUpdateRequest(ApplicationStatus.INTERVIEW, "Interview scheduled");
        ApplicationResponse updated = applicationService.updateApplicationStatus(100L, updateReq);

        assertNotNull(updated);
        assertEquals(ApplicationStatus.INTERVIEW, sampleApplication.getStatus());
        assertEquals("Interview scheduled", sampleApplication.getRecruiterNotes());
        verify(notificationService, times(1)).createNotification(eq(sampleUser), anyString(), anyString(), anyString());
    }
}
