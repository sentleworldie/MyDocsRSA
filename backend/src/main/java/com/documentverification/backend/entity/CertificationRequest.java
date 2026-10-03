package com.documentverification.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "certification_requests")
public class CertificationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "has_certified_copy", nullable = false)
    private boolean hasCertifiedCopy;

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_path", nullable = false)
    private ProcessingPath processingPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CertificationRequestStatus status;

    @Column(length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CertificationRequest() {}

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        if (status == null) status = CertificationRequestStatus.SUBMITTED;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }
    public boolean isHasCertifiedCopy() { return hasCertifiedCopy; }
    public void setHasCertifiedCopy(boolean hasCertifiedCopy) { this.hasCertifiedCopy = hasCertifiedCopy; }
    public ProcessingPath getProcessingPath() { return processingPath; }
    public void setProcessingPath(ProcessingPath processingPath) { this.processingPath = processingPath; }
    public CertificationRequestStatus getStatus() { return status; }
    public void setStatus(CertificationRequestStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void touch() { updatedAt = LocalDateTime.now(); }
}
