package com.jobportal.backend.controller;

import com.jobportal.backend.dto.request.ForgotPasswordRequest;
import com.jobportal.backend.dto.request.LoginRequest;
import com.jobportal.backend.dto.request.RegisterRequest;
import com.jobportal.backend.dto.request.ResetPasswordRequest;
import com.jobportal.backend.dto.response.AuthResponse;
import com.jobportal.backend.dto.response.MessageResponse;
import com.jobportal.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Login, Register, HttpOnly Cookies, Logout, and Password Recovery APIs")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT + HttpOnly Cookie")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.authenticateUser(loginRequest);
        ResponseCookie jwtCookie = authService.generateJwtCookie(loginRequest);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(response);
    }

    @PostMapping("/register")
    @Operation(summary = "Register new user (ADMIN, MANAGER, EMPLOYEE, USER)")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = authService.registerUser(registerRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate password recovery by sending reset token/email")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        MessageResponse response = authService.initiatePasswordReset(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Complete password recovery using token and new password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        MessageResponse response = authService.completePasswordReset(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Clear authentication cookie and logout user")
    public ResponseEntity<MessageResponse> logoutUser() {
        ResponseCookie cookie = authService.logoutUser();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new MessageResponse("You've been logged out successfully!"));
    }
}
