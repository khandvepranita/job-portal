package com.jobportal.backend.dto.request;

public class CandidateProfileRequest {

    private String headline;
    private String phone;
    private String location;
    private String experienceYears;
    private String currentCompany;
    private String summary;
    private String skills;
    private String experiences;
    private String education;
    private String resumeFileName;

    public CandidateProfileRequest() {}

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
}
