package com.jobportal.backend.dto.response;

import com.jobportal.backend.model.ApplicationStatus;
import com.jobportal.backend.model.JobApplication;
import java.time.LocalDateTime;

public class ApplicationResponse {

    private Long id;
    private Long jobId;
    private String jobTitle;
    private String jobCompany;
    private String jobLocation;
    private String jobType;
    private String jobSalary;

    private Long candidateId;
    private String candidateName;
    private String candidateEmail;

    private ApplicationStatus status;
    private String coverLetter;
    private String resumeFileName;
    private String resumeFilePath;
    private Integer matchScore;
    private String matchReason;
    private String recruiterNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ApplicationResponse() {}

    public static ApplicationResponse fromEntity(JobApplication app) {
        ApplicationResponse res = new ApplicationResponse();
        res.setId(app.getId());

        if (app.getJob() != null) {
            res.setJobId(app.getJob().getId());
            res.setJobTitle(app.getJob().getTitle());
            res.setJobCompany(app.getJob().getCompany());
            res.setJobLocation(app.getJob().getLocation());
            res.setJobType(app.getJob().getType());
            res.setJobSalary(app.getJob().getSalary());
        }

        if (app.getUser() != null) {
            res.setCandidateId(app.getUser().getId());
            res.setCandidateName(app.getUser().getName());
            res.setCandidateEmail(app.getUser().getEmail());
        }

        res.setStatus(app.getStatus());
        res.setCoverLetter(app.getCoverLetter());
        res.setResumeFileName(app.getResumeFileName());
        res.setResumeFilePath(app.getResumeFilePath());
        res.setMatchScore(app.getMatchScore());
        res.setMatchReason(app.getMatchReason());
        res.setRecruiterNotes(app.getRecruiterNotes());
        res.setCreatedAt(app.getCreatedAt());
        res.setUpdatedAt(app.getUpdatedAt());

        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getJobCompany() { return jobCompany; }
    public void setJobCompany(String jobCompany) { this.jobCompany = jobCompany; }

    public String getJobLocation() { return jobLocation; }
    public void setJobLocation(String jobLocation) { this.jobLocation = jobLocation; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public String getJobSalary() { return jobSalary; }
    public void setJobSalary(String jobSalary) { this.jobSalary = jobSalary; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }

    public String getResumeFilePath() { return resumeFilePath; }
    public void setResumeFilePath(String resumeFilePath) { this.resumeFilePath = resumeFilePath; }

    public Integer getMatchScore() { return matchScore; }
    public void setMatchScore(Integer matchScore) { this.matchScore = matchScore; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }

    public String getRecruiterNotes() { return recruiterNotes; }
    public void setRecruiterNotes(String recruiterNotes) { this.recruiterNotes = recruiterNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
