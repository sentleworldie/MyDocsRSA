package com.documentverification.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam Long userId,
            @RequestParam DocumentType documentType,
            @RequestParam MultipartFile file) {

        try {

            Document document = documentService.uploadDocument(
                    userId,
                    documentType,
                    file
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Document uploaded successfully",
                            "documentId", document.getId(),
                            "documentType",
                            document.getDocumentType().name(),
                            "status",
                            document.getStatus().name(),
                            "fileName",
                            document.getOriginalFileName()
                    ));

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message", e.getMessage()
                    ));
        }
    }
}