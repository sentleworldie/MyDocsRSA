package com.documentverification.backend.dto;

import java.time.LocalDateTime;

import com.documentverification.backend.entity.CertificationRequest;

/**


 * Creates the CertificationRequestResponse object used by the MyDocs RSA backend.


 */


/**
 * Represents the certification-request information returned to the mobile app or officer/admin interface.
 */
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
    /**

     * Handles the from operation used by the MyDocs RSA backend.

     */

    public static CertificationRequestResponse from(CertificationRequest r) {
        return new CertificationRequestResponse(r.getId(), r.getDocument().getId(),
                r.getDocument().getDocumentType().name(), r.isHasCertifiedCopy(),
                r.getProcessingPath().name(), r.getStatus().name(), r.getCreatedAt(), r.getUpdatedAt(), r.getNotes());
    }
}
