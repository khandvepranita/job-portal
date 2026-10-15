package com.jobportal.backend.dto.request;

import jakarta.validation.constraints.NotNull;

public class ApplicationRequest {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    private String coverLetter;

    private String resumeFileName;

    public ApplicationRequest() {}

    public ApplicationRequest(Long jobId, String coverLetter, String resumeFileName) {
        this.jobId = jobId;
        this.coverLetter = coverLetter;
        this.resumeFileName = resumeFileName;
    }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }
}
