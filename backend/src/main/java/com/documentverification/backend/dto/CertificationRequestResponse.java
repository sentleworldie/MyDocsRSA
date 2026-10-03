package com.documentverification.backend.dto;

import java.time.LocalDateTime;

import com.documentverification.backend.entity.CertificationRequest;

public record CertificationRequestResponse(
        Long requestId,
        Long documentId,
        String documentType,
        boolean hasCertifiedCopy,
        String processingPath,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String notes) {
    public static CertificationRequestResponse from(CertificationRequest r) {
        return new CertificationRequestResponse(r.getId(), r.getDocument().getId(),
                r.getDocument().getDocumentType().name(), r.isHasCertifiedCopy(),
                r.getProcessingPath().name(), r.getStatus().name(), r.getCreatedAt(), r.getUpdatedAt(), r.getNotes());
    }
}
