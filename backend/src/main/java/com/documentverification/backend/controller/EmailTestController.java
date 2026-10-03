package com.documentverification.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.documentverification.backend.service.EmailService;

@RestController
public class EmailTestController {

    private final EmailService emailService;

    public EmailTestController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping("/api/test-email")
    public String testEmail(@RequestParam String recipient) {

        if (recipient == null || recipient.isBlank() || !recipient.contains("@")) {
            throw new IllegalArgumentException("A valid recipient email is required");
        }

        emailService.sendTestEmail(recipient);

        return "Test email sent successfully";
    }
}