package com.documentverification.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.documentverification.backend.dto.LoginRequest;
import com.documentverification.backend.dto.RegisterRequest;
import com.documentverification.backend.dto.UpdateAccountRequest;
import com.documentverification.backend.entity.User;
import com.documentverification.backend.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Registration successful",
                            "userId", user.getId(),
                            "fullName", user.getFullName(),
                            "email", user.getEmail(),
                            "role", user.getRole().name(),
                            "token", authService.createToken(user)
                    ));

        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message", e.getMessage()
                    ));
        }
    } // <-- Added missing closing brace for the register method

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            User user = authService.getCurrentUser(authentication.getName());

            return ResponseEntity.ok(Map.of(
                    "userId", user.getId(),
                    "fullName", user.getFullName(),
                    "email", user.getEmail(),
                    "phoneNumber", user.getPhoneNumber() == null ? "" : user.getPhoneNumber(),
                    "role", user.getRole().name(),
                    "active", user.getActive()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(
            @Valid @RequestBody UpdateAccountRequest request,
            Authentication authentication) {

        try {
            User user = authService.updateCurrentUser(
                    authentication.getName(),
                    request.getFullName(),
                    request.getPhoneNumber(),
                    request.getPassword()
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Account updated successfully",
                    "userId", user.getId(),
                    "fullName", user.getFullName(),
                    "email", user.getEmail(),
                    "phoneNumber", user.getPhoneNumber() == null ? "" : user.getPhoneNumber(),
                    "role", user.getRole().name()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteCurrentUser(Authentication authentication) {
        try {
            authService.deleteCurrentUser(authentication.getName());

            return ResponseEntity.ok(
                    Map.of("message", "Account deleted successfully")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = authService.login(
                    request.getEmail(),
                    request.getPassword()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Login successful",
                            "userId", user.getId(),
                            "fullName", user.getFullName(),
                            "email", user.getEmail(),
                            "role", user.getRole().name(),
                            "token", authService.createToken(user)
                    )
            );

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message", e.getMessage()
                    ));
        }
    }
}