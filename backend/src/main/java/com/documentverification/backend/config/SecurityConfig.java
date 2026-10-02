package com.documentverification.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        // Authentication
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login")
                        .permitAll()

                        // Document testing
                        .requestMatchers(
                                "/api/documents/upload",
                                "/api/documents/user/**",
                                "/api/documents/**")
                        .permitAll()

                        // Verification testing
                        .requestMatchers(
                                "/api/verification/**")
                        .permitAll()

                        // Explicitly allow PUT verification requests
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/verification/**")
                        .permitAll()

                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/test-email").permitAll()

                        .anyRequest().authenticated());

        return http.build();
    }
}