package com.jobportal.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public void sendPasswordResetEmail(String recipientEmail, String resetToken) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + resetToken;

        logger.info("================== [OUTGOING SYSTEM EMAIL] ==================");
        logger.info("TO: {}", recipientEmail);
        logger.info("SUBJECT: JobPortal Account - Password Reset Request");
        logger.info("BODY:");
        logger.info("Hello,");
        logger.info("We received a request to reset your JobPortal password.");
        logger.info("Please use the secure link below to reset your password (valid for 15 minutes):");
        logger.info("{}", resetUrl);
        logger.info("Or use Reset Token: {}", resetToken);
        logger.info("If you did not request this, please ignore this email.");
        logger.info("=============================================================");
    }

    public void sendApplicationNotificationEmail(String recipientEmail, String jobTitle, String company, String status) {
        logger.info("================== [OUTGOING SYSTEM EMAIL] ==================");
        logger.info("TO: {}", recipientEmail);
        logger.info("SUBJECT: Update on your application for {} at {}", jobTitle, company);
        logger.info("BODY:");
        logger.info("Hello,");
        logger.info("Your application status for '{}' at '{}' has been updated to: {}.", jobTitle, company, status);
        logger.info("Log in to your JobPortal dashboard to view the latest recruiter notes.");
        logger.info("=============================================================");
    }
}
