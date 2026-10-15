package com.jobportal.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.jobportal.backend.model.audit.BaseAuditEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "candidate_profiles", indexes = {
    @Index(name = "idx_profile_user", columnList = "user_id")
})
public class CandidateProfile extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"password", "createdAt", "updatedAt"})
    private User user;

    @Column(length = 200)
    private String headline;

    @Column(length = 50)
    private String phone;

    @Column(length = 150)
    private String location;

    @Column(length = 50)
    private String experienceYears;

    @Column(length = 150)
    private String currentCompany;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String skills; // JSON or comma-separated list of skills

    @Column(columnDefinition = "LONGTEXT")
    private String experiences; // JSON string of work experiences

    @Column(columnDefinition = "LONGTEXT")
    private String education; // JSON string of education records

    @Column(length = 255)
    private String resumeFileName;

    @Column(length = 500)
    private String resumeFilePath;

    @Column(name = "profile_completion")
    private Integer profileCompletion = 0;

    public CandidateProfile() {}

    public CandidateProfile(User user) {
        this.user = user;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getExperienceYears() { return experienceYears; }
    public void setExperienceYears(String experienceYears) { this.experienceYears = experienceYears; }

    public String getCurrentCompany() { return currentCompany; }
    public void setCurrentCompany(String currentCompany) { this.currentCompany = currentCompany; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getExperiences() { return experiences; }
    public void setExperiences(String experiences) { this.experiences = experiences; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }

    public String getResumeFilePath() { return resumeFilePath; }
    public void setResumeFilePath(String resumeFilePath) { this.resumeFilePath = resumeFilePath; }

    public Integer getProfileCompletion() { return profileCompletion; }
    public void setProfileCompletion(Integer profileCompletion) { this.profileCompletion = profileCompletion; }
}
