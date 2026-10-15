package com.jobportal.backend.dto.request;

public class ATSCheckRequest {

    private Long jobId;
    private String candidateSkills;
    private String candidateSummary;
    private String candidateExperience;
    private String resumeText;

    public ATSCheckRequest() {}

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getCandidateSkills() { return candidateSkills; }
    public void setCandidateSkills(String candidateSkills) { this.candidateSkills = candidateSkills; }

    public String getCandidateSummary() { return candidateSummary; }
    public void setCandidateSummary(String candidateSummary) { this.candidateSummary = candidateSummary; }

    public String getCandidateExperience() { return candidateExperience; }
    public void setCandidateExperience(String candidateExperience) { this.candidateExperience = candidateExperience; }

    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }
}
