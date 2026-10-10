package com.jobportal.backend.service;

import com.jobportal.backend.dto.request.JobRequest;
import com.jobportal.backend.dto.response.PagedResponse;
import com.jobportal.backend.model.Job;

public interface JobService {
    PagedResponse<Job> getAllJobs(int page, int size, String sortBy, String sortDir, String search);
    Job getJobById(Long id);
    Job createJob(JobRequest jobRequest);
    Job updateJob(Long id, JobRequest jobRequest);
    void deleteJob(Long id);
}
