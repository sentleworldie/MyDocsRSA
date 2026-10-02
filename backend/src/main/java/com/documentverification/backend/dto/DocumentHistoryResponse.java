package com.documentverification.backend.dto;

import java.time.LocalDateTime;

import com.documentverification.backend.entity.DocumentType;
import com.documentverification.backend.entity.VerificationStatus;

public class DocumentHistoryResponse {

    private Long documentId;
    private DocumentType documentType;
    private String fileName;
    private VerificationStatus status;
    private String rejectionReason;
    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;
    private Long previousDocumentId;

    public DocumentHistoryResponse() {
    }

    public DocumentHistoryResponse(
            Long documentId,
            DocumentType documentType,
            String fileName,
            VerificationStatus status,
            String rejectionReason,
            LocalDateTime uploadedAt,
            LocalDateTime updatedAt,
            Long previousDocumentId) {

        this.documentId = documentId;
        this.documentType = documentType;
        this.fileName = fileName;
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.uploadedAt = uploadedAt;
        this.updatedAt = updatedAt;
        this.previousDocumentId = previousDocumentId;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public DocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(DocumentType documentType) {
        this.documentType = documentType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public VerificationStatus getStatus() {
        return status;
    }

    public void setStatus(VerificationStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getPreviousDocumentId() {
        return previousDocumentId;
    }

    public void setPreviousDocumentId(Long previousDocumentId) {
        this.previousDocumentId = previousDocumentId;
    }
}