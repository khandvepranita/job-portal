-- Seed Data for H2 Profile
INSERT INTO users (name, email, password, role, status, created_at, created_by) VALUES
('System Admin', 'admin@jobportal.com', '$2a$10$e0MYzXyjpJS7Pd0RVvHwHe1D.L693aGZl.6tB.s82t/XG7d3c0p.y', 'ROLE_ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, 'SEED'),
('Hiring Manager', 'manager@jobportal.com', '$2a$10$e0MYzXyjpJS7Pd0RVvHwHe1D.L693aGZl.6tB.s82t/XG7d3c0p.y', 'ROLE_MANAGER', 'ACTIVE', CURRENT_TIMESTAMP, 'SEED'),
('Regular Applicant', 'user@jobportal.com', '$2a$10$e0MYzXyjpJS7Pd0RVvHwHe1D.L693aGZl.6tB.s82t/XG7d3c0p.y', 'ROLE_USER', 'ACTIVE', CURRENT_TIMESTAMP, 'SEED');

INSERT INTO jobs (title, company, location, type, description, salary, status, created_at, created_by) VALUES
('Senior Java 21 & Spring Boot Developer', 'TechCorp Solutions', 'Remote', 'Full-time', 'Join our backend engineering team building scalable RESTful microservices with Spring Boot, Spring Data JPA, and MySQL.', '$110,000 - $140,000', 'ACTIVE', CURRENT_TIMESTAMP, 'admin@jobportal.com'),
('React.js Frontend Engineer', 'WebCraft Interactive', 'New York, NY', 'Full-time', 'Develop modern, high-performance web applications using React 18, Vite, and CSS3 with seamless API integrations.', '$95,000 - $120,000', 'ACTIVE', CURRENT_TIMESTAMP, 'manager@jobportal.com'),
('Full Stack Engineer (Java + React)', 'InnoLab Systems', 'Hybrid (Austin, TX)', 'Full-time', 'Looking for a versatile full-stack developer skilled in Spring Security, RESTful Web Services, and React.js.', '$105,000 - $135,000', 'ACTIVE', CURRENT_TIMESTAMP, 'admin@jobportal.com'),
('DevOps & Cloud Infrastructure Specialist', 'CloudScale DevOps', 'Remote', 'Contract', 'Manage CI/CD pipelines, Docker container orchestration, and cloud infrastructure for enterprise microservices.', '$75 - $90 / hr', 'ACTIVE', CURRENT_TIMESTAMP, 'manager@jobportal.com'),
('Software Engineering Intern', 'NextGen Innovations', 'San Francisco, CA', 'Internship', 'Great internship opportunity for students and recent grads to gain hands-on experience with Java 21, Spring Boot, and React.', '$35 / hr', 'ACTIVE', CURRENT_TIMESTAMP, 'admin@jobportal.com');
