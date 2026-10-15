package com.jobportal.backend.service;

import com.jobportal.backend.dto.request.ForgotPasswordRequest;
import com.jobportal.backend.dto.request.LoginRequest;
import com.jobportal.backend.dto.request.RegisterRequest;
import com.jobportal.backend.dto.request.ResetPasswordRequest;
import com.jobportal.backend.dto.response.AuthResponse;
import com.jobportal.backend.dto.response.MessageResponse;
import org.springframework.http.ResponseCookie;

public interface AuthService {
    AuthResponse registerUser(RegisterRequest registerRequest);
    AuthResponse authenticateUser(LoginRequest loginRequest);
    ResponseCookie generateJwtCookie(LoginRequest loginRequest);
    ResponseCookie logoutUser();

    MessageResponse initiatePasswordReset(ForgotPasswordRequest request);
    MessageResponse completePasswordReset(ResetPasswordRequest request);
}
