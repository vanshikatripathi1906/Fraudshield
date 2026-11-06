package com.fraudshield.service;

import com.fraudshield.dto.AuthResponse;
import com.fraudshield.dto.LoginRequest;
import com.fraudshield.dto.RegisterRequest;
import com.fraudshield.dto.UserDto;
import com.fraudshield.exception.ApiException;
import com.fraudshield.model.User;
import com.fraudshield.repository.UserRepository;
import com.fraudshield.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse register(RegisterRequest request) {
        if (request == null || request.getName() == null || request.getEmail() == null || request.getPassword() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Name, email and password are required");
        }

        String cleanName = request.getName().trim();
        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (cleanName.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Name cannot be empty");
        }
        if (cleanName.length() > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Name is too long");
        }

        if (!EMAIL_PATTERN.matcher(cleanEmail).matches()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please provide a valid email address");
        }
        if (cleanEmail.length() > 150) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email is too long");
        }

        String password = request.getPassword();
        if (password.length() < 8) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }
        if (password.length() > 128) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password is too long");
        }

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new ApiException(HttpStatus.CONFLICT, "User already exists");
        }

        String hashedPassword = passwordEncoder.encode(password);
        User user = new User(cleanName, cleanEmail, hashedPassword, "USER");
        User savedUser = userRepository.save(user);

        return new AuthResponse("Registration successful", new UserDto(savedUser));
    }

    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        String cleanEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getRole());

        // Set HttpOnly cookie
        ResponseCookie cookie = ResponseCookie.from("token", token)
                .httpOnly(true)
                .secure(false) // Set to true if HTTPS production
                .sameSite("Lax")
                .path("/")
                .maxAge(24 * 60 * 60)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return new AuthResponse("Login successful", new UserDto(user));
    }

    public UserDto getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return new UserDto(user);
    }

    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
