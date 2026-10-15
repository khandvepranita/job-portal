package com.jobportal.backend.repository;

import com.jobportal.backend.model.ApplicationStatus;
import com.jobportal.backend.model.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<JobApplication> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<JobApplication> findByJobIdOrderByCreatedAtDesc(Long jobId);

    Page<JobApplication> findByJobIdOrderByCreatedAtDesc(Long jobId, Pageable pageable);

    Optional<JobApplication> findByUserIdAndJobId(Long userId, Long jobId);

    boolean existsByUserIdAndJobId(Long userId, Long jobId);

    long countByStatus(ApplicationStatus status);

    @Query("SELECT j.status, COUNT(j) FROM JobApplication j GROUP BY j.status")
    List<Object[]> countApplicationsByStatusGroup();

    @Query("SELECT COUNT(j) FROM JobApplication j WHERE j.job.id = :jobId")
    long countByJobId(@Param("jobId") Long jobId);
}
