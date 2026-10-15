package com.jobportal.backend.dto.response;

import java.util.Map;

public class DashboardStatsResponse {

    private long totalJobs;
    private long activeJobs;
    private long totalApplications;
    private long totalUsers;
    private long shortlistedCount;
    private long interviewedCount;
    private long acceptedCount;
    private long rejectedCount;
    private Map<String, Long> statusBreakdown;

    public DashboardStatsResponse() {}

    public long getTotalJobs() { return totalJobs; }
    public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }

    public long getActiveJobs() { return activeJobs; }
    public void setActiveJobs(long activeJobs) { this.activeJobs = activeJobs; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getShortlistedCount() { return shortlistedCount; }
    public void setShortlistedCount(long shortlistedCount) { this.shortlistedCount = shortlistedCount; }

    public long getInterviewedCount() { return interviewedCount; }
    public void setInterviewedCount(long interviewedCount) { this.interviewedCount = interviewedCount; }

    public long getAcceptedCount() { return acceptedCount; }
    public void setAcceptedCount(long acceptedCount) { this.acceptedCount = acceptedCount; }

    public long getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(long rejectedCount) { this.rejectedCount = rejectedCount; }

    public Map<String, Long> getStatusBreakdown() { return statusBreakdown; }
    public void setStatusBreakdown(Map<String, Long> statusBreakdown) { this.statusBreakdown = statusBreakdown; }
}
