package com.jobportal.backend.model;

import com.jobportal.backend.model.audit.BaseAuditEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_job_title", columnList = "title"),
    @Index(name = "idx_job_company", columnList = "company"),
    @Index(name = "idx_job_status", columnList = "status")
})
public class Job extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Job title is required")
    @Column(nullable = false, length = 150)
    private String title;

    @NotBlank(message = "Company name is required")
    @Column(nullable = false, length = 100)
    private String company;

    @NotBlank(message = "Location is required")
    @Column(nullable = false, length = 100)
    private String location;

    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String salary;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private Status status = Status.ACTIVE;

    public Job() {}

    public Job(String title, String company, String location, String type, String description, String salary) {
        this.title = title;
        this.company = company;
        this.location = location;
        this.type = type;
        this.description = description;
        this.salary = salary;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
