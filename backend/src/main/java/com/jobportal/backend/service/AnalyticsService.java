package com.jobportal.backend.service;

import com.jobportal.backend.dto.response.DashboardStatsResponse;
import com.jobportal.backend.model.ApplicationStatus;
import com.jobportal.backend.model.Status;
import com.jobportal.backend.repository.JobApplicationRepository;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        long totalJobs = jobRepository.count();
        long activeJobs = jobRepository.countByStatus(Status.ACTIVE);
        long totalApps = applicationRepository.count();
        long totalUsers = userRepository.count();

        stats.setTotalJobs(totalJobs);
        stats.setActiveJobs(activeJobs);
        stats.setTotalApplications(totalApps);
        stats.setTotalUsers(totalUsers);

        stats.setShortlistedCount(applicationRepository.countByStatus(ApplicationStatus.SHORTLISTED));
        stats.setInterviewedCount(applicationRepository.countByStatus(ApplicationStatus.INTERVIEW));
        stats.setAcceptedCount(applicationRepository.countByStatus(ApplicationStatus.ACCEPTED));
        stats.setRejectedCount(applicationRepository.countByStatus(ApplicationStatus.REJECTED));

        Map<String, Long> statusMap = new HashMap<>();
        for (ApplicationStatus st : ApplicationStatus.values()) {
            statusMap.put(st.name(), 0L);
        }

        List<Object[]> grouped = applicationRepository.countApplicationsByStatusGroup();
        for (Object[] row : grouped) {
            if (row[0] != null && row[1] != null) {
                statusMap.put(row[0].toString(), (Long) row[1]);
            }
        }
        stats.setStatusBreakdown(statusMap);

        return stats;
    }
}
