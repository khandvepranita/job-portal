package com.jobportal.backend.service.impl;

import com.jobportal.backend.dto.request.JobRequest;
import com.jobportal.backend.dto.response.PagedResponse;
import com.jobportal.backend.exception.ResourceNotFoundException;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.Status;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class JobServiceImpl implements JobService {

    @Autowired
    private JobRepository jobRepository;

    @Override
    public PagedResponse<Job> getAllJobs(int page, int size, String sortBy, String sortDir, String search) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Job> jobs;
        if (StringUtils.hasText(search)) {
            jobs = jobRepository.searchJobs(Status.ACTIVE, search, pageable);
        } else {
            jobs = jobRepository.findByStatus(Status.ACTIVE, pageable);
        }

        return new PagedResponse<>(
                jobs.getContent(),
                jobs.getNumber(),
                jobs.getSize(),
                jobs.getTotalElements(),
                jobs.getTotalPages(),
                jobs.isLast()
        );
    }

    @Override
    public Job getJobById(Long id) {
        return jobRepository.findByIdAndStatus(id, Status.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Job", "id", id));
    }

    @Override
    public Job createJob(JobRequest jobRequest) {
        Job job = new Job(
                jobRequest.getTitle(),
                jobRequest.getCompany(),
                jobRequest.getLocation(),
                jobRequest.getType(),
                jobRequest.getDescription(),
                jobRequest.getSalary()
        );
        job.setStatus(Status.ACTIVE);
        return jobRepository.save(job);
    }

    @Override
    public Job updateJob(Long id, JobRequest jobRequest) {
        Job job = getJobById(id);
        job.setTitle(jobRequest.getTitle());
        job.setCompany(jobRequest.getCompany());
        job.setLocation(jobRequest.getLocation());
        job.setType(jobRequest.getType());
        job.setDescription(jobRequest.getDescription());
        job.setSalary(jobRequest.getSalary());
        return jobRepository.save(job);
    }

    @Override
    public void deleteJob(Long id) {
        Job job = getJobById(id);
        // Soft Delete (status = INACTIVE as per architecture specs)
        job.setStatus(Status.INACTIVE);
        jobRepository.save(job);
    }
}
