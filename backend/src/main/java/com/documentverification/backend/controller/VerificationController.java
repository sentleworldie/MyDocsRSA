package com.documentverification.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.documentverification.backend.dto.ReviewRequest;
import com.documentverification.backend.entity.Document;
import com.documentverification.backend.dto.DocumentResponse;
import com.documentverification.backend.service.VerificationService;

@RestController
@RequestMapping("/api/verification")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(
            VerificationService verificationService) {

        this.verificationService = verificationService;
    }

    // ============================================================
    // GET PENDING DOCUMENTS
    // ============================================================

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingDocuments() {

        try {

            List<Document> documents =
                    verificationService.getPendingDocuments();

            return ResponseEntity.ok(documents.stream().map(DocumentResponse::from).toList());

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    // ============================================================
    // START REVIEW
    // ============================================================

    @PutMapping("/{documentId}/review")
    public ResponseEntity<?> startReview(
            @PathVariable Long documentId) {

        try {

            Document document =
                    verificationService.startReview(documentId);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Document is now under review",
                            "documentId",
                            document.getId(),
                            "status",
                            document.getStatus().name()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    // ============================================================
    // APPROVE DOCUMENT
    // ============================================================

    @PutMapping("/{documentId}/approve")
    public ResponseEntity<?> approveDocument(
            @PathVariable Long documentId) {

        try {

            Document document =
                    verificationService.approveDocument(documentId);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Document approved successfully",
                            "documentId",
                            document.getId(),
                            "status",
                            document.getStatus().name()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    // ============================================================
    // REJECT DOCUMENT
    // ============================================================

    @PutMapping("/{documentId}/reject")
    public ResponseEntity<?> rejectDocument(
            @PathVariable Long documentId,
            @Valid @RequestBody ReviewRequest request) {

        try {

            Document document =
                    verificationService.rejectDocument(
                            documentId,
                            request.getReason()
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Document rejected",
                            "documentId",
                            document.getId(),
                            "status",
                            document.getStatus().name(),
                            "reason",
                            document.getRejectionReason()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    // ============================================================
    // REQUEST RESUBMISSION
    // ============================================================

    @PutMapping("/{documentId}/resubmission")
    public ResponseEntity<?> requestResubmission(
            @PathVariable Long documentId,
            @Valid @RequestBody ReviewRequest request) {

        try {

            Document document =
                    verificationService.requestResubmission(
                            documentId,
                            request.getReason()
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Document requires resubmission",
                            "documentId",
                            document.getId(),
                            "status",
                            document.getStatus().name(),
                            "reason",
                            document.getRejectionReason()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }
}