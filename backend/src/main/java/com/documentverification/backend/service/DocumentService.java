package com.documentverification.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.documentverification.backend.dto.DocumentHistoryResponse;
import com.documentverification.backend.entity.Document;
import com.documentverification.backend.entity.DocumentType;
import com.documentverification.backend.entity.User;
import com.documentverification.backend.entity.VerificationStatus;
import com.documentverification.backend.repository.DocumentRepository;
import com.documentverification.backend.repository.UserRepository;

@Service
public class DocumentService {

        private final DocumentRepository documentRepository;
        private final UserRepository userRepository;
        private final DocumentValidationService documentValidationService;

        private final Path uploadDirectory = Paths.get("document-storage").toAbsolutePath().normalize();

        public DocumentService(
                        DocumentRepository documentRepository,
                        UserRepository userRepository,
                        DocumentValidationService documentValidationService) {

                this.documentRepository = documentRepository;
                this.userRepository = userRepository;
                this.documentValidationService = documentValidationService;

                try {
                        Files.createDirectories(uploadDirectory);
                } catch (IOException e) {
                        throw new RuntimeException(
                                        "Could not create document storage directory", e);
                }
        }

        // ============================================================
        // UPLOAD DOCUMENT
        // ============================================================

        public Document uploadDocument(
                        Long userId,
                        DocumentType documentType,
                        MultipartFile file) {
                documentValidationService.validateUpload(file);

                if (file == null || file.isEmpty()) {
                        throw new RuntimeException("Document file is required");
                }

                if (file.getSize() > 10 * 1024 * 1024) {
                        throw new RuntimeException(
                                        "File size must not exceed 10 MB");
                }

                String originalFileName = file.getOriginalFilename();

                if (originalFileName != null) {
                        originalFileName = java.nio.file.Paths.get(originalFileName).getFileName().toString();
                }

                if (originalFileName == null || originalFileName.isBlank()) {
                        throw new RuntimeException("Invalid file name");
                }

                String fileExtension = "";

                int dotIndex = originalFileName.lastIndexOf(".");

                if (dotIndex > 0
                                && dotIndex < originalFileName.length() - 1) {

                        fileExtension = originalFileName
                                        .substring(dotIndex + 1)
                                        .toLowerCase();
                }

                if (!fileExtension.equals("pdf")
                                && !fileExtension.equals("jpg")
                                && !fileExtension.equals("jpeg")
                                && !fileExtension.equals("png")) {

                        throw new RuntimeException(
                                        "Only PDF, JPG, JPEG and PNG files are allowed");
                }

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String storedFileName = UUID.randomUUID() + "_" + originalFileName;

                Path targetLocation = uploadDirectory
                                .resolve(storedFileName)
                                .normalize();

                try {

                        Files.copy(
                                        file.getInputStream(),
                                        targetLocation,
                                        StandardCopyOption.REPLACE_EXISTING);

                } catch (IOException e) {

                        throw new RuntimeException(
                                        "Could not store document", e);
                }

                Document document = new Document();

                document.setUser(user);
                document.setDocumentName(originalFileName);
                document.setDocumentType(documentType);
                document.setStatus(VerificationStatus.PENDING);
                document.setOriginalFileName(originalFileName);
                document.setStoredFileName(storedFileName);
                document.setFilePath(targetLocation.toString());

                return documentRepository.save(document);
        }

        // ============================================================
        // RESUBMIT DOCUMENT
        // ============================================================

        public Document resubmitDocument(
                        Long previousDocumentId,
                        MultipartFile file) {
                documentValidationService.validateUpload(file);

                if (file == null || file.isEmpty()) {
                        throw new RuntimeException("Document file is required");
                }

                if (file.getSize() > 10 * 1024 * 1024) {
                        throw new RuntimeException(
                                        "File size must not exceed 10 MB");
                }

                Document previousDocument = documentRepository
                                .findById(previousDocumentId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Previous document not found"));

                if (previousDocument.getStatus() != VerificationStatus.RESUBMISSION_REQUIRED) {

                        throw new RuntimeException(
                                        "This document does not require resubmission");
                }

                String originalFileName = file.getOriginalFilename();

                if (originalFileName != null) {
                        originalFileName = java.nio.file.Paths.get(originalFileName).getFileName().toString();
                }

                if (originalFileName == null
                                || originalFileName.isBlank()) {

                        throw new RuntimeException("Invalid file name");
                }

                String fileExtension = "";

                int dotIndex = originalFileName.lastIndexOf(".");

                if (dotIndex > 0
                                && dotIndex < originalFileName.length() - 1) {

                        fileExtension = originalFileName
                                        .substring(dotIndex + 1)
                                        .toLowerCase();
                }

                if (!fileExtension.equals("pdf")
                                && !fileExtension.equals("jpg")
                                && !fileExtension.equals("jpeg")
                                && !fileExtension.equals("png")) {

                        throw new RuntimeException(
                                        "Only PDF, JPG, JPEG and PNG files are allowed");
                }

                String storedFileName = UUID.randomUUID() + "_" + originalFileName;

                Path targetLocation = uploadDirectory
                                .resolve(storedFileName)
                                .normalize();

                try {

                        Files.copy(
                                        file.getInputStream(),
                                        targetLocation,
                                        StandardCopyOption.REPLACE_EXISTING);

                } catch (IOException e) {

                        throw new RuntimeException(
                                        "Could not store document", e);
                }

                Document newDocument = new Document();

                newDocument.setUser(previousDocument.getUser());

                newDocument.setDocumentType(
                                previousDocument.getDocumentType());

                newDocument.setDocumentName(originalFileName);

                newDocument.setStatus(
                                VerificationStatus.PENDING);

                newDocument.setOriginalFileName(
                                originalFileName);

                newDocument.setStoredFileName(
                                storedFileName);

                newDocument.setFilePath(
                                targetLocation.toString());

                newDocument.setPreviousDocument(
                                previousDocument);

                return documentRepository.save(newDocument);
        }

        // ============================================================
        // GET ALL DOCUMENTS FOR A USER
        // ============================================================

        public List<Document> getDocumentsByUser(Long userId) {

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return documentRepository.findByUser(user);
        }

        // ============================================================
        // GET ONE DOCUMENT
        // ============================================================

        public Document getDocumentById(Long documentId) {

                return documentRepository.findById(documentId)
                                .orElseThrow(() -> new RuntimeException("Document not found"));
        }
        // ============================================================
        // GET DOCUMENT HISTORY
        // ============================================================

        public List<DocumentHistoryResponse> getDocumentHistory(
                        Long documentId) {

                Document currentDocument = documentRepository
                                .findById(documentId)
                                .orElseThrow(() -> new RuntimeException("Document not found"));

                List<DocumentHistoryResponse> history = new ArrayList<>();

                Document current = currentDocument;

                while (current != null) {

                        Long previousDocumentId = null;

                        if (current.getPreviousDocument() != null) {
                                previousDocumentId = current.getPreviousDocument().getId();
                        }

                        DocumentHistoryResponse response = new DocumentHistoryResponse(
                                        current.getId(),
                                        current.getDocumentType(),
                                        current.getOriginalFileName(),
                                        current.getStatus(),
                                        current.getRejectionReason(),
                                        current.getUploadedAt(),
                                        current.getUpdatedAt(),
                                        previousDocumentId);

                        history.add(response);

                        current = current.getPreviousDocument();
                }

                return history;
        }
        // ============================================================
        // DOWNLOAD VERIFIED DOCUMENT
        // ============================================================

        public Resource downloadDocument(Long documentId) {

                Document document = documentRepository.findById(documentId)
                                .orElseThrow(() -> new RuntimeException("Document not found"));

                if (document.getStatus() != VerificationStatus.APPROVED) {
                        throw new RuntimeException(
                                        "Only approved documents can be downloaded");
                }

                // Validate that the stored file still exists,
                // is a valid file, is readable, and is not empty.
                documentValidationService.validateStoredFile(
                                document.getFilePath());

                try {

                        Path filePath = Paths.get(
                                        document.getFilePath())
                                        .toAbsolutePath()
                                        .normalize();

                        Resource resource = new UrlResource(filePath.toUri());

                        return resource;

                } catch (IOException e) {

                        throw new RuntimeException(
                                        "Could not access document file",
                                        e);
                }
        }
}