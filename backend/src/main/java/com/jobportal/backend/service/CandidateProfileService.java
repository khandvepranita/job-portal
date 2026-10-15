package com.jobportal.backend.service;

import com.jobportal.backend.dto.request.CandidateProfileRequest;
import com.jobportal.backend.exception.ResourceNotFoundException;
import com.jobportal.backend.model.CandidateProfile;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.CandidateProfileRepository;
import com.jobportal.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class CandidateProfileService {

    @Autowired
    private CandidateProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/resumes/";

    @Transactional
    public CandidateProfile getOrCreateProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    CandidateProfile newProfile = new CandidateProfile(user);
                    newProfile.setHeadline("");
                    newProfile.setSkills("");
                    newProfile.setProfileCompletion(15);
                    return profileRepository.save(newProfile);
                });
    }

    public CandidateProfile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user id: " + userId));
    }

    @Transactional
    public CandidateProfile updateProfile(String email, CandidateProfileRequest request) {
        CandidateProfile profile = getOrCreateProfile(email);

        if (request.getHeadline() != null) profile.setHeadline(request.getHeadline());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getLocation() != null) profile.setLocation(request.getLocation());
        if (request.getExperienceYears() != null) profile.setExperienceYears(request.getExperienceYears());
        if (request.getCurrentCompany() != null) profile.setCurrentCompany(request.getCurrentCompany());
        if (request.getSummary() != null) profile.setSummary(request.getSummary());
        if (request.getSkills() != null) profile.setSkills(request.getSkills());
        if (request.getExperiences() != null) profile.setExperiences(request.getExperiences());
        if (request.getEducation() != null) profile.setEducation(request.getEducation());
        if (request.getResumeFileName() != null) profile.setResumeFileName(request.getResumeFileName());

        profile.setProfileCompletion(computeCompletionScore(profile));

        return profileRepository.save(profile);
    }

    @Transactional
    public CandidateProfile uploadResume(String email, MultipartFile file) throws IOException {
        CandidateProfile profile = getOrCreateProfile(email);

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty resume file.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String storedFileName = "resume_" + profile.getUser().getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path targetLocation = uploadPath.resolve(storedFileName);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        profile.setResumeFileName(originalFilename != null ? originalFilename : storedFileName);
        profile.setResumeFilePath(targetLocation.toString());
        profile.setProfileCompletion(computeCompletionScore(profile));

        return profileRepository.save(profile);
    }

    public Path getResumeFilePath(Long userId) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        if (profile.getResumeFilePath() == null) {
            throw new ResourceNotFoundException("No resume file uploaded for this candidate.");
        }

        Path path = Paths.get(profile.getResumeFilePath());
        if (!Files.exists(path)) {
            throw new ResourceNotFoundException("Resume file not found on disk.");
        }

        return path;
    }

    private int computeCompletionScore(CandidateProfile p) {
        int score = 0;
        if (p.getUser() != null && p.getUser().getName() != null) score += 15;
        if (p.getHeadline() != null && !p.getHeadline().isBlank()) score += 15;
        if (p.getPhone() != null && !p.getPhone().isBlank()) score += 10;
        if (p.getLocation() != null && !p.getLocation().isBlank()) score += 10;
        if (p.getSummary() != null && p.getSummary().length() >= 20) score += 15;
        if (p.getSkills() != null && !p.getSkills().isBlank()) score += 15;
        if (p.getExperiences() != null && !p.getExperiences().isBlank()) score += 10;
        if (p.getEducation() != null && !p.getEducation().isBlank()) score += 10;
        return Math.min(100, Math.max(15, score));
    }
}
