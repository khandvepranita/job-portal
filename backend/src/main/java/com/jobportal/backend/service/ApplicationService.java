package com.jobportal.backend.service;

import com.jobportal.backend.dto.request.ATSCheckRequest;
import com.jobportal.backend.dto.request.ApplicationRequest;
import com.jobportal.backend.dto.request.ApplicationStatusUpdateRequest;
import com.jobportal.backend.dto.response.ATSAnalysisResponse;
import com.jobportal.backend.dto.response.ApplicationResponse;
import com.jobportal.backend.exception.BadRequestException;
import com.jobportal.backend.exception.ResourceNotFoundException;
import com.jobportal.backend.model.*;
import com.jobportal.backend.repository.CandidateProfileRepository;
import com.jobportal.backend.repository.JobApplicationRepository;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private JobApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateProfileRepository profileRepository;

    @Autowired
    private CandidateProfileService profileService;

    @Autowired
    private ATSScoringService atsScoringService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public ApplicationResponse applyToJob(String userEmail, ApplicationRequest request, MultipartFile resumeFile) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + request.getJobId()));

        if (job.getStatus() != Status.ACTIVE) {
            throw new BadRequestException("This job position is no longer accepting active applications.");
        }

        if (applicationRepository.existsByUserIdAndJobId(user.getId(), job.getId())) {
            throw new BadRequestException("You have already submitted an application for this position.");
        }

        CandidateProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);

        // Resume file resolution: if file uploaded now, use it; else fallback to profile resume
        String resumeFileName = request.getResumeFileName();
        String resumeFilePath = null;

        if (resumeFile != null && !resumeFile.isEmpty()) {
            try {
                CandidateProfile updated = profileService.uploadResume(userEmail, resumeFile);
                resumeFileName = updated.getResumeFileName();
                resumeFilePath = updated.getResumeFilePath();
            } catch (IOException e) {
                throw new BadRequestException("Failed to upload resume document: " + e.getMessage());
            }
        } else if (profile != null) {
            if (resumeFileName == null || resumeFileName.isBlank()) {
                resumeFileName = profile.getResumeFileName();
            }
            resumeFilePath = profile.getResumeFilePath();
        }

        // Automatic ATS compatibility analysis
        ATSCheckRequest atsRequest = new ATSCheckRequest();
        atsRequest.setJobId(job.getId());
        if (profile != null) {
            atsRequest.setCandidateSkills(profile.getSkills());
            atsRequest.setCandidateSummary(profile.getSummary());
            atsRequest.setCandidateExperience(profile.getExperiences());
        }
        ATSAnalysisResponse atsResult = atsScoringService.analyzeMatch(job, atsRequest);

        JobApplication application = new JobApplication();
        application.setUser(user);
        application.setJob(job);
        application.setStatus(ApplicationStatus.APPLIED);
        application.setCoverLetter(request.getCoverLetter());
        application.setResumeFileName(resumeFileName != null ? resumeFileName : "Resume_" + user.getName().replaceAll("\\s+", "_") + ".pdf");
        application.setResumeFilePath(resumeFilePath);
        application.setMatchScore(atsResult.getMatchScore());
        application.setMatchReason(atsResult.getRoleReadinessSummary());

        JobApplication saved = applicationRepository.save(application);

        // Send applicant notification
        notificationService.createNotification(
                user,
                "Application Submitted Successfully",
                "Your application for '" + job.getTitle() + "' at " + job.getCompany() + " has been received with a " + atsResult.getMatchScore() + "% ATS match score.",
                "APPLICATION_UPDATE"
        );

        return ApplicationResponse.fromEntity(saved);
    }

    public List<ApplicationResponse> getUserApplications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return applicationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getJobApplications(Long jobId) {
        if (!jobRepository.existsById(jobId)) {
            throw new ResourceNotFoundException("Job not found with id: " + jobId);
        }

        return applicationRepository.findByJobIdOrderByCreatedAtDesc(jobId)
                .stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ApplicationResponse getApplicationById(Long id) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
        return ApplicationResponse.fromEntity(application);
    }

    @Transactional
    public ApplicationResponse updateApplicationStatus(Long id, ApplicationStatusUpdateRequest request) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        application.setStatus(request.getStatus());
        if (request.getRecruiterNotes() != null) {
            application.setRecruiterNotes(request.getRecruiterNotes());
        }

        JobApplication updated = applicationRepository.save(application);

        // Send notification to applicant
        notificationService.createNotification(
                application.getUser(),
                "Application Status Update: " + request.getStatus().name(),
                "Your application for '" + application.getJob().getTitle() + "' has been updated to: " + request.getStatus().name().replace('_', ' ') + ".",
                "APPLICATION_UPDATE"
        );

        return ApplicationResponse.fromEntity(updated);
    }
}
