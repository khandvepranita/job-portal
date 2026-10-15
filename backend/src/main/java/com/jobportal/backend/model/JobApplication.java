package com.jobportal.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.jobportal.backend.model.audit.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "job_applications", indexes = {
    @Index(name = "idx_application_user", columnList = "user_id"),
    @Index(name = "idx_application_job", columnList = "job_id"),
    @Index(name = "idx_application_status", columnList = "status"),
    @Index(name = "idx_user_job_unique", columnList = "user_id, job_id", unique = true)
})
public class JobApplication extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "createdAt", "updatedAt"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    @Column(length = 255)
    private String resumeFileName;

    @Column(length = 500)
    private String resumeFilePath;

    @Column(name = "match_score")
    private Integer matchScore;

    @Column(columnDefinition = "TEXT")
    private String matchReason;

    @Column(columnDefinition = "TEXT")
    private String recruiterNotes;

    public JobApplication() {}

    public JobApplication(User user, Job job, String coverLetter, String resumeFileName, String resumeFilePath) {
        this.user = user;
        this.job = job;
        this.coverLetter = coverLetter;
        this.resumeFileName = resumeFileName;
        this.resumeFilePath = resumeFilePath;
        this.status = ApplicationStatus.APPLIED;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }

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
}
