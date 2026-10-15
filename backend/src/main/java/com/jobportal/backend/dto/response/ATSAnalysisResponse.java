package com.jobportal.backend.dto.response;

import java.util.List;

public class ATSAnalysisResponse {

    private int matchScore; // 0 - 100
    private String matchCategory; // Exceptional Match, Strong Fit, Moderate Fit, Needs Improvement
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> suggestions;
    private String roleReadinessSummary;

    public ATSAnalysisResponse() {}

    public ATSAnalysisResponse(int matchScore, String matchCategory, List<String> matchedSkills, List<String> missingSkills, List<String> suggestions, String roleReadinessSummary) {
        this.matchScore = matchScore;
        this.matchCategory = matchCategory;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.suggestions = suggestions;
        this.roleReadinessSummary = roleReadinessSummary;
    }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

    public String getMatchCategory() { return matchCategory; }
    public void setMatchCategory(String matchCategory) { this.matchCategory = matchCategory; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public String getRoleReadinessSummary() { return roleReadinessSummary; }
    public void setRoleReadinessSummary(String roleReadinessSummary) { this.roleReadinessSummary = roleReadinessSummary; }
}
