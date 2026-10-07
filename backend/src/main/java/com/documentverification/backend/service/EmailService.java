package com.documentverification.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendTestEmail(String recipient) {

        sendEmail(recipient,
                "Document Verification System - Test Email", """
                                                             Hello,
                                                             
                                                             This is a test email from the Document Verification System.
                                                             
                                                             If you received this email, the backend email configuration is working correctly.
                                                             
                                                             Regards,
                                                             MyDocs RSA""");
    }

    public void sendWelcomeEmail(String recipientEmail, String recipientName) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom("mydocsrsa@gmail.com");
        message.setTo(recipientEmail);
        message.setSubject("Welcome to MyDocs RSA");

        message.setText(
                "Hello " + recipientName + ",\n\n" +
                "Welcome to MyDocs RSA!\n\n" +
                "Your account has been successfully created.\n\n" +
                "You can now log in to MyDocs RSA and submit your documents " +
                "for digital certification.\n\n" +
                "Thank you for using MyDocs RSA.\n\n" +
                "MyDocs RSA Team"
        );

        mailSender.send(message);
    }
    
    public void sendDocumentStatusEmail(
            String recipient,
            String subject,
            String messageText) {

        sendEmail(recipient, subject, messageText);
    }

    private void sendEmail(
            String recipient,
            String subject,
            String messageText) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(messageText);

        mailSender.send(message);
    }
}