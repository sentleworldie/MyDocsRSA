package com.documentverification.backend.dto;

import java.time.LocalDateTime;

import com.documentverification.backend.entity.DigitalCredential;

public record CredentialResponse(
        Long credentialId,
        Long documentId,
        String documentType,
        String status,
        String verificationCode,
        LocalDateTime issuedAt,
        LocalDateTime validUntil) {
    public static CredentialResponse from(DigitalCredential c) {
        String status = c.getStatus().name();
        if (c.getValidUntil() != null && c.getValidUntil().isBefore(LocalDateTime.now()) && "ACTIVE".equals(status)) {
            status = "EXPIRED";
        }
        return new CredentialResponse(c.getId(), c.getDocument().getId(), c.getDocument().getDocumentType().name(),
                status, c.getVerificationCode(), c.getIssuedAt(), c.getValidUntil());
    }
}
