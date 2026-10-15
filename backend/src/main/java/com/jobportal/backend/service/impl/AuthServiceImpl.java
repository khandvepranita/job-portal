package com.jobportal.backend.service.impl;

import com.jobportal.backend.dto.request.ForgotPasswordRequest;
import com.jobportal.backend.dto.request.LoginRequest;
import com.jobportal.backend.dto.request.RegisterRequest;
import com.jobportal.backend.dto.request.ResetPasswordRequest;
import com.jobportal.backend.dto.response.AuthResponse;
import com.jobportal.backend.dto.response.MessageResponse;
import com.jobportal.backend.exception.BadRequestException;
import com.jobportal.backend.exception.ResourceNotFoundException;
import com.jobportal.backend.model.PasswordResetToken;
import com.jobportal.backend.model.Role;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.PasswordResetTokenRepository;
import com.jobportal.backend.repository.UserRepository;
import com.jobportal.backend.security.UserDetailsImpl;
import com.jobportal.backend.security.jwt.JwtTokenProvider;
import com.jobportal.backend.service.AuthService;
import com.jobportal.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository resetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private EmailService emailService;

    @Override
    public AuthResponse registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Error: Email is already in use!");
        }

        Role userRole = Role.ROLE_USER;
        if (registerRequest.getRole() != null) {
            try {
                String roleStr = registerRequest.getRole().toUpperCase();
                if (!roleStr.startsWith("ROLE_")) {
                    roleStr = "ROLE_" + roleStr;
                }
                userRole = Role.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                userRole = Role.ROLE_USER;
            }
        }

        User user = new User(
                registerRequest.getName(),
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                userRole
        );

        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateTokenFromUsername(savedUser.getEmail());

        return new AuthResponse(savedUser.getId(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole().name(), token);
    }

    @Override
    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String token = jwtTokenProvider.generateTokenFromUsername(userDetails.getUsername());
        String role = userDetails.getAuthorities().stream().findFirst().map(a -> a.getAuthority()).orElse("ROLE_USER");

        return new AuthResponse(userDetails.getId(), userDetails.getName(), userDetails.getEmail(), role, token);
    }

    @Override
    public ResponseCookie generateJwtCookie(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return jwtTokenProvider.generateJwtCookie(userDetails);
    }

    @Override
    public ResponseCookie logoutUser() {
        return jwtTokenProvider.getCleanJwtCookie();
    }

    @Override
    @Transactional
    public MessageResponse initiatePasswordReset(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("No registered account found with email: " + request.getEmail()));

        // Generate clean 8-character token
        String token = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Find existing token record for user or create fresh
        PasswordResetToken resetToken = resetTokenRepository.findByUserId(user.getId())
                .orElse(new PasswordResetToken());
        resetToken.setUser(user);
        resetToken.setToken(token);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        resetToken.setUsed(false);
        resetTokenRepository.saveAndFlush(resetToken);

        // Dispatch simulated/real email
        emailService.sendPasswordResetEmail(user.getEmail(), token);

        return new MessageResponse("Password reset instructions generated! Token: " + token + " (Valid for 15 minutes)", token);
    }

    @Override
    @Transactional
    public MessageResponse completePasswordReset(ResetPasswordRequest request) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(request.getToken().trim().toUpperCase())
                .orElseThrow(() -> new BadRequestException("Invalid or unrecognized password reset token."));

        if (resetToken.isUsed()) {
            throw new BadRequestException("This password reset token has already been used.");
        }

        if (resetToken.isExpired()) {
            throw new BadRequestException("This password reset token has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        return new MessageResponse("Password reset successfully! You can now log in with your new password.");
    }
}
