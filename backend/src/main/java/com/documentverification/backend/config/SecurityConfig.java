package com.documentverification.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.documentverification.backend.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers("/api/test-email").hasRole("ADMIN")
                        .requestMatchers("/api/verification/**", "/api/certification/requests/pending", "/api/certification/requests/*/review", "/api/certification/requests/*/approve", "/api/certification/requests/*/reject", "/api/certification/requests/*/more-information", "/api/certification/verify/**").hasAnyRole("ADMIN", "POLICE_OFFICER")
                        .requestMatchers("/api/documents/upload", "/api/documents/resubmit", "/api/certification/requests", "/api/certification/requests/me", "/api/certification/credentials/me", "/api/certification/credentials/*", "/api/credentials/*/request").hasRole("USER")
                        .requestMatchers("/api/documents/user/**", "/api/documents/*/history", "/api/documents/*/download", "/api/documents/*")
                            .hasAnyRole("USER", "ADMIN", "POLICE_OFFICER")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
