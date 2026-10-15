package com.jobportal.backend.service;

import com.jobportal.backend.exception.BadRequestException;
import com.jobportal.backend.exception.ResourceNotFoundException;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.SavedJob;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.SavedJobRepository;
import com.jobportal.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SavedJobService {

    @Autowired
    private SavedJobRepository savedJobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Transactional
    public SavedJob saveJob(String userEmail, Long jobId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        if (savedJobRepository.existsByUserIdAndJobId(user.getId(), job.getId())) {
            throw new BadRequestException("Job is already in your saved jobs.");
        }

        SavedJob savedJob = new SavedJob(user, job);
        return savedJobRepository.save(savedJob);
    }

    @Transactional
    public void unsaveJob(String userEmail, Long jobId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        savedJobRepository.deleteByUserIdAndJobId(user.getId(), jobId);
    }

    public List<SavedJob> getSavedJobs(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));
        return savedJobRepository.findByUserIdOrderBySavedAtDesc(user.getId());
    }

    public boolean isJobSaved(String userEmail, Long jobId) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return false;
        return savedJobRepository.existsByUserIdAndJobId(user.getId(), jobId);
    }
}
