package com.jobportal.backend.config;

import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.Status;
import com.jobportal.backend.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired
    private JobRepository jobRepository;

    @Override
    public void run(String... args) throws Exception {
        if (jobRepository.count() == 0) {
            logger.info("No job records found in database. Seeding 5 realistic sample jobs...");

            List<Job> sampleJobs = List.of(
                new Job(
                    "Senior Java 21 & Spring Boot Developer",
                    "TechCorp Solutions",
                    "Remote",
                    "Full-time",
                    "Join our backend engineering team building scalable RESTful microservices with Spring Boot, Spring Data JPA, and MySQL.",
                    "$110,000 - $140,000"
                ),
                new Job(
                    "React.js Frontend Engineer",
                    "WebCraft Interactive",
                    "New York, NY",
                    "Full-time",
                    "Develop modern, high-performance web applications using React 18, Vite, and CSS3 with seamless API integrations.",
                    "$95,000 - $120,000"
                ),
                new Job(
                    "Full Stack Engineer (Java + React)",
                    "InnoLab Systems",
                    "Hybrid (Austin, TX)",
                    "Full-time",
                    "Looking for a versatile full-stack developer skilled in Spring Security, RESTful Web Services, and React.js.",
                    "$105,000 - $135,000"
                ),
                new Job(
                    "DevOps & Cloud Infrastructure Specialist",
                    "CloudScale DevOps",
                    "Remote",
                    "Contract",
                    "Manage CI/CD pipelines, Docker container orchestration, and cloud infrastructure for enterprise microservices.",
                    "$75 - $90 / hr"
                ),
                new Job(
                    "Software Engineering Intern",
                    "NextGen Innovations",
                    "San Francisco, CA",
                    "Internship",
                    "Great internship opportunity for students and recent grads to gain hands-on experience with Java 21, Spring Boot, and React.",
                    "$35 / hr"
                )
            );

            sampleJobs.forEach(job -> job.setStatus(Status.ACTIVE));
            jobRepository.saveAll(sampleJobs);
            logger.info("Successfully seeded 5 sample jobs into the database.");
        } else {
            logger.info("Database already contains {} job record(s). Skipping automatic seeding.", jobRepository.count());
        }
    }
}
