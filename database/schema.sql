-- Enterprise Job Portal Database Schema (MySQL)
CREATE DATABASE IF NOT EXISTS jobportal_db;
USE jobportal_db;

-- 1. Users Table with Audit & RBAC
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER', -- ROLE_ADMIN, ROLE_MANAGER, ROLE_EMPLOYEE, ROLE_USER
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE (Soft delete)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    INDEX idx_user_email (email),
    INDEX idx_user_status (status)
);

-- 2. Jobs Table with Soft Delete & Auditing
CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    company VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'Full-time',
    description TEXT,
    salary VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE (Soft delete)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    INDEX idx_job_title (title),
    INDEX idx_job_company (company),
    INDEX idx_job_status (status)
);

-- 3. Refresh Tokens Table (Rotation & Revocation)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample Seed Data
INSERT INTO users (name, email, password, role, status, created_by) VALUES
('System Admin', 'admin@jobportal.com', '$2a$10$e0MYzXyjpJS7Pd0RVvHwHe1D.L693aGZl.6tB.s82t/XG7d3c0p.y', 'ROLE_ADMIN', 'ACTIVE', 'SEED'),
('Hiring Manager', 'manager@jobportal.com', '$2a$10$e0MYzXyjpJS7Pd0RVvHwHe1D.L693aGZl.6tB.s82t/XG7d3c0p.y', 'ROLE_MANAGER', 'ACTIVE', 'SEED'),
('Regular Applicant', 'user@jobportal.com', '$2a$10$e0MYzXyjpJS7Pd0RVvHwHe1D.L693aGZl.6tB.s82t/XG7d3c0p.y', 'ROLE_USER', 'ACTIVE', 'SEED');

INSERT INTO jobs (title, company, location, type, description, salary, status, created_by) VALUES
('Senior Java 21 & Spring Boot Developer', 'TechCorp Solutions', 'Remote', 'Full-time', 'Join our backend engineering team building scalable RESTful microservices with Spring Boot, Spring Data JPA, and MySQL.', '$110,000 - $140,000', 'ACTIVE', 'admin@jobportal.com'),
('React.js Frontend Engineer', 'WebCraft Interactive', 'New York, NY', 'Full-time', 'Develop modern, high-performance web applications using React 18, Vite, and CSS3 with seamless API integrations.', '$95,000 - $120,000', 'ACTIVE', 'manager@jobportal.com'),
('Full Stack Engineer (Java + React)', 'InnoLab Systems', 'Hybrid (Austin, TX)', 'Full-time', 'Looking for a versatile full-stack developer skilled in Spring Security, RESTful Web Services, and React.js.', '$105,000 - $135,000', 'ACTIVE', 'admin@jobportal.com'),
('DevOps & Cloud Infrastructure Specialist', 'CloudScale DevOps', 'Remote', 'Contract', 'Manage CI/CD pipelines, Docker container orchestration, and cloud infrastructure for enterprise microservices.', '$75 - $90 / hr', 'ACTIVE', 'manager@jobportal.com'),
('Software Engineering Intern', 'NextGen Innovations', 'San Francisco, CA', 'Internship', 'Great internship opportunity for students and recent grads to gain hands-on experience with Java 21, Spring Boot, and React.', '$35 / hr', 'ACTIVE', 'admin@jobportal.com');
