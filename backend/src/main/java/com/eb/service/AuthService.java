package com.eb.service;

import com.eb.dto.AuthResponse;
import com.eb.dto.LoginRequest;
import com.eb.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
