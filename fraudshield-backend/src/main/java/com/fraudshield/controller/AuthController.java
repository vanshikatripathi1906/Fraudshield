package com.fraudshield.controller;

import com.fraudshield.dto.ApiResponse;
import com.fraudshield.dto.AuthResponse;
import com.fraudshield.dto.LoginRequest;
import com.fraudshield.dto.RegisterRequest;
import com.fraudshield.dto.UserDto;
import com.fraudshield.security.UserPrincipal;
import com.fraudshield.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request, response);
        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto userDto = authService.getProfile(userPrincipal.getId());
        Map<String, Object> response = new HashMap<>();
        response.put("user", userDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(new ApiResponse("Logout successful"));
    }

    @GetMapping("/admin-test")
    public ResponseEntity<Map<String, Object>> adminTest(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", userPrincipal.getId());
        userInfo.put("role", userPrincipal.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Admin access verified");
        response.put("user", userInfo);

        return ResponseEntity.ok(response);
    }
}

