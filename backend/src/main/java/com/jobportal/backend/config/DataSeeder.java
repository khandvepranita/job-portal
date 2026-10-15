package com.jobportal.backend.config;

import com.jobportal.backend.model.*;
import com.jobportal.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateProfileRepository profileRepository;

    @Autowired
    private JobApplicationRepository applicationRepository;

    @Autowired
    private SavedJobRepository savedJobRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Users if not present
        User adminUser = userRepository.findByEmail("admin@jobportal.com").orElse(null);
        if (adminUser == null) {
            adminUser = new User("System Admin", "admin@jobportal.com", passwordEncoder.encode("Admin@123"), Role.ROLE_ADMIN);
            adminUser.setStatus(Status.ACTIVE);
            userRepository.save(adminUser);
        }

        User managerUser = userRepository.findByEmail("manager@jobportal.com").orElse(null);
        if (managerUser == null) {
            managerUser = new User("Hiring Manager", "manager@jobportal.com", passwordEncoder.encode("Manager@123"), Role.ROLE_MANAGER);
            managerUser.setStatus(Status.ACTIVE);
            userRepository.save(managerUser);
        }

        User applicantUser = userRepository.findByEmail("user@jobportal.com").orElse(null);
        if (applicantUser == null) {
            applicantUser = new User("Alex Morgan", "user@jobportal.com", passwordEncoder.encode("User@123"), Role.ROLE_USER);
            applicantUser.setStatus(Status.ACTIVE);
            applicantUser = userRepository.save(applicantUser);
        }

        User pranitaUser = userRepository.findByEmail("khandvepranita905@gmail.com").orElse(null);
        if (pranitaUser == null) {
            pranitaUser = new User("Pranita Khandve", "khandvepranita905@gmail.com", passwordEncoder.encode("Pranita@123"), Role.ROLE_USER);
            pranitaUser.setStatus(Status.ACTIVE);
            userRepository.save(pranitaUser);
        }

        // 2. Seed Jobs if not present
        if (jobRepository.count() == 0) {
            logger.info("No job records found. Seeding 5 enterprise sample jobs...");

            List<Job> sampleJobs = List.of(
                new Job(
                    "Senior Java 21 & Spring Boot Developer",
                    "TechCorp Solutions",
                    "Remote",
                    "Full-time",
                    "Join our backend engineering team building scalable RESTful microservices with Spring Boot, Spring Data JPA, and MySQL. Requires Java 21, Spring Boot, Docker, and REST APIs.",
                    "$110,000 - $140,000"
                ),
                new Job(
                    "React.js Frontend Engineer",
                    "WebCraft Interactive",
                    "New York, NY",
                    "Full-time",
                    "Develop modern, high-performance web applications using React 18, Vite, and CSS3 with seamless API integrations. Skills: React, JavaScript, CSS, HTML, Vite.",
                    "$95,000 - $120,000"
                ),
                new Job(
                    "Full Stack Engineer (Java + React)",
                    "InnoLab Systems",
                    "Hybrid (Austin, TX)",
                    "Full-time",
                    "Versatile full-stack engineer needed for enterprise cloud applications. Tech stack: Java, Spring Boot, React, MySQL, Docker, RESTful APIs, Git.",
                    "$105,000 - $135,000"
                ),
                new Job(
                    "DevOps & Cloud Infrastructure Specialist",
                    "CloudScale DevOps",
                    "Remote",
                    "Contract",
                    "Manage CI/CD pipelines, Docker container orchestration, and cloud infrastructure for enterprise microservices with Kubernetes, AWS, and Linux.",
                    "$75 - $90 / hr"
                ),
                new Job(
                    "Software Engineering Intern",
                    "NextGen Innovations",
                    "San Francisco, CA",
                    "Internship",
                    "Hands-on internship for aspiring engineers. Gain production experience with Java 21, Spring Boot, React, and Git.",
                    "$35 / hr"
                )
            );

            sampleJobs.forEach(job -> job.setStatus(Status.ACTIVE));
            jobRepository.saveAll(sampleJobs);
            logger.info("Successfully seeded 5 sample jobs.");
        }

        // 3. Seed Candidate Profile for applicantUser
        if (applicantUser != null && profileRepository.findByUserId(applicantUser.getId()).isEmpty()) {
            CandidateProfile profile = new CandidateProfile(applicantUser);
            profile.setHeadline("Full Stack Software Engineer | Java 21 & React");
            profile.setPhone("+1 (555) 349-2810");
            profile.setLocation("San Francisco, CA (Open to Remote)");
            profile.setExperienceYears("4 Years");
            profile.setCurrentCompany("InnoTech Solutions");
            profile.setSummary("Passionate Full Stack Software Engineer with 4+ years building high-availability RESTful web applications using Spring Boot, React, MySQL, and Docker. Strong focus on clean architecture, security, and scalable systems.");
            profile.setSkills("Java, Spring Boot, Spring Security, React, JavaScript, Docker, MySQL, REST APIs, Git, JUnit");
            profile.setResumeFileName("Alex_Morgan_FullStack_Resume.pdf");
            profile.setProfileCompletion(95);
            profileRepository.save(profile);
            logger.info("Seeded candidate profile for Alex Morgan (user@jobportal.com).");
        }

        // 4. Seed Sample Applications & Notifications if empty
        if (applicantUser != null && applicationRepository.count() == 0) {
            List<Job> allJobs = jobRepository.findAll();
            if (!allJobs.isEmpty()) {
                Job job1 = allJobs.get(0);
                JobApplication app1 = new JobApplication(applicantUser, job1, "I have 4+ years of Java and Spring Boot experience building production services.", "Alex_Morgan_Resume.pdf", null);
                app1.setStatus(ApplicationStatus.UNDER_REVIEW);
                app1.setMatchScore(92);
                app1.setMatchReason("Strong match across Java, Spring Boot, and REST API competencies.");
                app1.setRecruiterNotes("Strong technical background, scheduled for initial screening call.");
                applicationRepository.save(app1);

                if (allJobs.size() > 2) {
                    Job job3 = allJobs.get(2);
                    JobApplication app2 = new JobApplication(applicantUser, job3, "Excited about the full-stack role combining Spring Boot backend with React frontend.", "Alex_Morgan_Resume.pdf", null);
                    app2.setStatus(ApplicationStatus.INTERVIEW);
                    app2.setMatchScore(96);
                    app2.setMatchReason("Exceptional match: candidate possesses both Java and React expertise.");
                    app2.setRecruiterNotes("Technical interview scheduled for Thursday 2:00 PM.");
                    applicationRepository.save(app2);
                }

                // Seed saved job
                if (allJobs.size() > 1) {
                    savedJobRepository.save(new SavedJob(applicantUser, allJobs.get(1)));
                }

                // Seed notifications
                notificationRepository.save(new Notification(
                    applicantUser,
                    "Application Received",
                    "Your application for Senior Java 21 & Spring Boot Developer at TechCorp Solutions is under review.",
                    "APPLICATION_UPDATE"
                ));
                notificationRepository.save(new Notification(
                    applicantUser,
                    "Interview Scheduled!",
                    "You have been shortlisted for an interview for Full Stack Engineer (Java + React) at InnoLab Systems.",
                    "APPLICATION_UPDATE"
                ));
            }
        }
    }
}
