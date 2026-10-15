package com.jobportal.backend.service;

import com.jobportal.backend.dto.request.ATSCheckRequest;
import com.jobportal.backend.dto.response.ATSAnalysisResponse;
import com.jobportal.backend.model.Job;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ATSScoringService {

    private static final List<String> COMMON_TECH_KEYWORDS = List.of(
            "java", "spring", "spring boot", "react", "react.js", "javascript", "typescript",
            "docker", "kubernetes", "aws", "azure", "gcp", "mysql", "postgresql", "mongodb",
            "redis", "rest", "restful", "microservices", "graphql", "ci/cd", "git", "github",
            "junit", "mockito", "html", "css", "tailwind", "redux", "next.js", "node.js",
            "python", "kafka", "elasticsearch", "linux", "agile", "scrum", "hibernate", "jpa"
    );

    public ATSAnalysisResponse analyzeMatch(Job job, ATSCheckRequest request) {
        String jobTitle = job.getTitle() != null ? job.getTitle().toLowerCase() : "";
        String jobDesc = job.getDescription() != null ? job.getDescription().toLowerCase() : "";
        String jobFullText = jobTitle + " " + jobDesc + " " + (job.getType() != null ? job.getType().toLowerCase() : "");

        StringBuilder candidateTextBuilder = new StringBuilder();
        if (request.getCandidateSkills() != null) candidateTextBuilder.append(" ").append(request.getCandidateSkills());
        if (request.getCandidateSummary() != null) candidateTextBuilder.append(" ").append(request.getCandidateSummary());
        if (request.getCandidateExperience() != null) candidateTextBuilder.append(" ").append(request.getCandidateExperience());
        if (request.getResumeText() != null) candidateTextBuilder.append(" ").append(request.getResumeText());

        String candidateText = candidateTextBuilder.toString().toLowerCase();

        // 1. Extract required keywords from job
        Set<String> requiredKeywords = extractKeywords(jobFullText);

        // Fallback: If no specific keywords matched from dictionary, pick words from title & desc
        if (requiredKeywords.isEmpty()) {
            requiredKeywords.addAll(extractGeneralKeywords(jobTitle + " " + jobDesc));
        }

        // 2. Extract matched and missing
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String keyword : requiredKeywords) {
            if (candidateText.contains(keyword.toLowerCase())) {
                matchedSkills.add(capitalizeWords(keyword));
            } else {
                missingSkills.add(capitalizeWords(keyword));
            }
        }

        // 3. Compute match percentage
        int total = requiredKeywords.size();
        int matched = matchedSkills.size();
        int baseScore = total > 0 ? (int) Math.round(((double) matched / total) * 100) : 75;

        // Give a slight bonus if candidate text contains exact job title keywords
        String[] titleWords = jobTitle.split("\\s+");
        long titleMatches = Arrays.stream(titleWords)
                .filter(w -> w.length() > 3 && candidateText.contains(w))
                .count();
        if (titleMatches >= 2 && baseScore < 95) {
            baseScore = Math.min(100, baseScore + 10);
        }

        // Keep within 25 - 98 range for realistic ATS behavior
        int finalScore = Math.max(25, Math.min(98, baseScore));

        // 4. Match Category
        String category;
        if (finalScore >= 85) {
            category = "Exceptional Match";
        } else if (finalScore >= 70) {
            category = "Strong Fit";
        } else if (finalScore >= 50) {
            category = "Moderate Fit";
        } else {
            category = "Skill Gap Identified";
        }

        // 5. Suggestions & Summary
        List<String> suggestions = new ArrayList<>();
        if (!missingSkills.isEmpty()) {
            suggestions.add("Add missing key skills to your profile: " + String.join(", ", missingSkills.stream().limit(4).toList()));
        }
        suggestions.add("Ensure your resume highlights quantifiable project achievements matching the job title '" + job.getTitle() + "'");
        suggestions.add("Include relevant certifications or hands-on experience with " + (matchedSkills.isEmpty() ? "required tools" : matchedSkills.get(0)));

        String summary = String.format("Candidate matches %d out of %d key technical competencies extracted from the job posting (%d%% match score).",
                matched, total, finalScore);

        return new ATSAnalysisResponse(finalScore, category, matchedSkills, missingSkills, suggestions, summary);
    }

    private Set<String> extractKeywords(String text) {
        Set<String> found = new LinkedHashSet<>();
        for (String kw : COMMON_TECH_KEYWORDS) {
            Pattern pattern = Pattern.compile("\\b" + Pattern.quote(kw) + "\\b", Pattern.CASE_INSENSITIVE);
            if (pattern.matcher(text).find()) {
                found.add(kw);
            }
        }
        return found;
    }

    private Set<String> extractGeneralKeywords(String text) {
        Set<String> words = new LinkedHashSet<>();
        String[] tokens = text.split("[^a-zA-Z0-9+#]+");
        for (String t : tokens) {
            if (t.length() >= 4 && !isStopword(t.toLowerCase())) {
                words.add(t.toLowerCase());
                if (words.size() >= 5) break;
            }
        }
        return words;
    }

    private boolean isStopword(String word) {
        Set<String> stopwords = Set.of("with", "have", "this", "that", "from", "they", "will", "would", "about", "there", "their", "which", "building", "looking", "experience", "developer", "engineer", "team");
        return stopwords.contains(word);
    }

    private String capitalizeWords(String input) {
        if (input == null || input.isEmpty()) return "";
        return Arrays.stream(input.split("\\s+"))
                .map(s -> s.length() > 0 ? Character.toUpperCase(s.charAt(0)) + s.substring(1) : s)
                .collect(Collectors.joining(" "));
    }
}
