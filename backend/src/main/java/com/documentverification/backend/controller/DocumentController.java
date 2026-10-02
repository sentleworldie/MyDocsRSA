package com.documentverification.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.documentverification.backend.dto.DocumentHistoryResponse;
import com.documentverification.backend.entity.Document;
import com.documentverification.backend.entity.DocumentType;
import com.documentverification.backend.service.DocumentService;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

        private final DocumentService documentService;

        public DocumentController(DocumentService documentService) {
                this.documentService = documentService;
        }

        // ============================================================
        // UPLOAD DOCUMENT
        // ============================================================

        @PostMapping("/upload")
        public ResponseEntity<?> uploadDocument(
                        @RequestParam Long userId,
                        @RequestParam DocumentType documentType,
                        @RequestParam MultipartFile file) {

                try {

                        Document document = documentService.uploadDocument(
                                        userId,
                                        documentType,
                                        file);

                        return ResponseEntity
                                        .status(HttpStatus.CREATED)
                                        .body(Map.of(
                                                        "message",
                                                        "Document uploaded successfully",

                                                        "documentId",
                                                        document.getId(),

                                                        "documentType",
                                                        document.getDocumentType().name(),

                                                        "status",
                                                        document.getStatus().name(),

                                                        "fileName",
                                                        document.getOriginalFileName()));

                } catch (RuntimeException e) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(Map.of(
                                                        "message",
                                                        e.getMessage()));
                }
        }

        // ============================================================
        // GET ALL DOCUMENTS FOR A USER
        // ============================================================

        @GetMapping("/user/{userId}")
        public ResponseEntity<?> getUserDocuments(
                        @PathVariable Long userId) {

                try {

                        List<Document> documents = documentService.getDocumentsByUser(userId);

                        return ResponseEntity.ok(documents);

                } catch (RuntimeException e) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(Map.of(
                                                        "message",
                                                        e.getMessage()));
                }
        }

        // ============================================================
        // GET SINGLE DOCUMENT
        // ============================================================

        @GetMapping("/{documentId}")
        public ResponseEntity<?> getDocument(
                        @PathVariable Long documentId) {

                try {

                        Document document = documentService.getDocumentById(documentId);

                        return ResponseEntity.ok(
                                        Map.of(
                                                        "documentId",
                                                        document.getId(),

                                                        "userId",
                                                        document.getUser().getId(),

                                                        "documentName",
                                                        document.getDocumentName(),

                                                        "documentType",
                                                        document.getDocumentType().name(),

                                                        "status",
                                                        document.getStatus().name(),

                                                        "originalFileName",
                                                        document.getOriginalFileName(),

                                                        "uploadedAt",
                                                        document.getUploadedAt(),

                                                        "updatedAt",
                                                        document.getUpdatedAt(),

                                                        "rejectionReason",
                                                        document.getRejectionReason() == null
                                                                        ? ""
                                                                        : document.getRejectionReason()));

                } catch (RuntimeException e) {

                        return ResponseEntity
                                        .status(HttpStatus.NOT_FOUND)
                                        .body(Map.of(
                                                        "message",
                                                        e.getMessage()));
                }
        }

        // ============================================================
        // RESUBMIT DOCUMENT
        // ============================================================

        @PostMapping("/resubmit")
        public ResponseEntity<?> resubmitDocument(
                        @RequestParam Long previousDocumentId,
                        @RequestParam MultipartFile file) {

                try {

                        Document document = documentService.resubmitDocument(
                                        previousDocumentId,
                                        file);

                        return ResponseEntity
                                        .status(HttpStatus.CREATED)
                                        .body(Map.of(
                                                        "message",
                                                        "Document resubmitted successfully",

                                                        "documentId",
                                                        document.getId(),

                                                        "previousDocumentId",
                                                        document.getPreviousDocument().getId(),

                                                        "documentType",
                                                        document.getDocumentType().name(),

                                                        "status",
                                                        document.getStatus().name(),

                                                        "fileName",
                                                        document.getOriginalFileName()));

                } catch (RuntimeException e) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(Map.of(
                                                        "message",
                                                        e.getMessage()));
                }
        }

        // ============================================================
        // GET DOCUMENT HISTORY
        // ============================================================

        @GetMapping("/{documentId}/history")
        public ResponseEntity<?> getDocumentHistory(
                        @PathVariable Long documentId) {

                try {

                        List<DocumentHistoryResponse> history = documentService.getDocumentHistory(
                                        documentId);

                        return ResponseEntity.ok(history);

                } catch (RuntimeException e) {

                        return ResponseEntity
                                        .status(HttpStatus.NOT_FOUND)
                                        .body(Map.of(
                                                        "message",
                                                        e.getMessage()));
                }
        }

        // ============================================================
        // DOWNLOAD VERIFIED DOCUMENT
        // ============================================================

        @GetMapping("/{documentId}/download")
        public ResponseEntity<?> downloadDocument(
                        @PathVariable Long documentId) {

                try {

                        Document document = documentService.getDocumentById(documentId);

                        Resource resource = documentService.downloadDocument(documentId);

                        return ResponseEntity.ok()
                                        .header(
                                                        HttpHeaders.CONTENT_DISPOSITION,
                                                        "attachment; filename=\"" +
                                                                        document.getOriginalFileName() +
                                                                        "\"")
                                        .header(
                                                        HttpHeaders.CONTENT_TYPE,
                                                        "application/octet-stream")
                                        .body(resource);

                } catch (RuntimeException e) {

                        return ResponseEntity
                                        .badRequest()
                                        .body(Map.of(
                                                        "message",
                                                        e.getMessage()));
                }
        }
}
