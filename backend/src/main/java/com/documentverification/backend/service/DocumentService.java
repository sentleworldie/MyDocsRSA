package com.documentverification.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.documentverification.backend.dto.DocumentHistoryResponse;
import com.documentverification.backend.entity.Document;
import com.documentverification.backend.entity.DocumentType;
import com.documentverification.backend.entity.ProcessingPath;
import com.documentverification.backend.entity.User;
import com.documentverification.backend.entity.VerificationStatus;
import com.documentverification.backend.repository.DocumentRepository;
import com.documentverification.backend.repository.CertificationRequestRepository;
import com.documentverification.backend.repository.DigitalCredentialRepository;
import com.documentverification.backend.repository.UserRepository;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final CertificationRequestRepository certificationRequestRepository;
    private final DigitalCredentialRepository digitalCredentialRepository;
    private final DocumentValidationService documentValidationService;
    private final Path uploadDirectory = Paths.get("document-storage").toAbsolutePath().normalize();

    public DocumentService(
            DocumentRepository documentRepository,
            UserRepository userRepository,
            CertificationRequestRepository certificationRequestRepository,
            DigitalCredentialRepository digitalCredentialRepository,
            DocumentValidationService documentValidationService) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.certificationRequestRepository = certificationRequestRepository;
        this.digitalCredentialRepository = digitalCredentialRepository;
        this.documentValidationService = documentValidationService;
        try { Files.createDirectories(uploadDirectory); }
        catch (IOException e) { throw new RuntimeException("Could not create document storage directory", e); }
    }

    public Document uploadDocument(Long userId, DocumentType documentType, MultipartFile file) {
        return uploadDocument(userId, documentType, file, false);
    }

    public Document uploadDocument(Long userId, DocumentType documentType, MultipartFile file, boolean hasCertifiedCopy) {
        validateFile(file);
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        String originalFileName = safeOriginalFileName(file);
        String storedFileName = UUID.randomUUID() + "_" + originalFileName;
        Path targetLocation = uploadDirectory.resolve(storedFileName).normalize();
        if (!targetLocation.startsWith(uploadDirectory)) throw new RuntimeException("Invalid document path");
        try (var input = file.getInputStream()) {
            Files.copy(input, targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) { throw new RuntimeException("Could not store document", e); }

        Document document = new Document();
        document.setUser(user);
        document.setDocumentName(originalFileName);
        document.setDocumentType(documentType);
        document.setStatus(VerificationStatus.PENDING);
        document.setOriginalFileName(originalFileName);
        document.setStoredFileName(storedFileName);
        document.setFilePath(targetLocation.toString());
        document.setHasCertifiedCopy(hasCertifiedCopy);
        document.setProcessingPath(hasCertifiedCopy ? ProcessingPath.FAST_TRACK_CERTIFIED_COPY : ProcessingPath.INVESTIGATION_REQUIRED);
        document.setFileFingerprint(fingerprint(file));
        return documentRepository.save(document);
    }

    public Document resubmitDocument(Long previousDocumentId, MultipartFile file) {
        validateFile(file);
        Document previous = documentRepository.findById(previousDocumentId)
                .orElseThrow(() -> new RuntimeException("Previous document not found"));
        if (previous.getStatus() != VerificationStatus.RESUBMISSION_REQUIRED)
            throw new RuntimeException("This document does not require resubmission");
        String originalFileName = safeOriginalFileName(file);
        String storedFileName = UUID.randomUUID() + "_" + originalFileName;
        Path targetLocation = uploadDirectory.resolve(storedFileName).normalize();
        try (var input = file.getInputStream()) { Files.copy(input, targetLocation, StandardCopyOption.REPLACE_EXISTING); }
        catch (IOException e) { throw new RuntimeException("Could not store document", e); }

        Document next = new Document();
        next.setUser(previous.getUser());
        next.setDocumentType(previous.getDocumentType());
        next.setDocumentName(originalFileName);
        next.setStatus(VerificationStatus.PENDING);
        next.setOriginalFileName(originalFileName);
        next.setStoredFileName(storedFileName);
        next.setFilePath(targetLocation.toString());
        next.setPreviousDocument(previous);
        next.setHasCertifiedCopy(previous.isHasCertifiedCopy());
        next.setProcessingPath(previous.getProcessingPath());
        next.setFileFingerprint(fingerprint(file));
        return documentRepository.save(next);
    }

    public List<Document> getDocumentsByUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return documentRepository.findByUser(user);
    }

    public Document getDocumentById(Long documentId) {
        return documentRepository.findById(documentId).orElseThrow(() -> new RuntimeException("Document not found"));
    }

    public Resource downloadDocument(Long documentId) {
        Document document = getDocumentById(documentId);
        try {
            Path path = Paths.get(document.getFilePath()).toAbsolutePath().normalize();
            if (!path.startsWith(uploadDirectory)) throw new RuntimeException("Invalid document path");
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) throw new RuntimeException("Document file is not available");
            return resource;
        } catch (IOException e) { throw new RuntimeException("Could not read document", e); }
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteDocumentForUser(Long documentId, Long userId) {
        Document document = getDocumentById(documentId);

        if (!document.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not allowed to delete this document");
        }

        if (document.getStatus() == VerificationStatus.UNDER_REVIEW
                || document.getStatus() == VerificationStatus.APPROVED) {
            throw new RuntimeException(
                    "Documents under review or approved documents cannot be permanently deleted"
            );
        }

        if (documentRepository.existsByPreviousDocument(document)) {
            throw new RuntimeException(
                    "This document has a resubmission linked to it and cannot be deleted"
            );
        }

        // Remove records that reference this document before deleting the document.
        digitalCredentialRepository.deleteByDocument(document);
        certificationRequestRepository.deleteByDocument(document);

        deleteStoredFile(document);
        documentRepository.delete(document);
    }

    private void deleteStoredFile(Document document) {
        if (document.getFilePath() == null || document.getFilePath().isBlank()) {
            return;
        }

        try {
            Path path = Paths.get(document.getFilePath()).toAbsolutePath().normalize();

            if (!path.startsWith(uploadDirectory)) {
                throw new RuntimeException("Invalid document path");
            }

            if (Files.exists(path)) {
                Files.delete(path);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not delete document file", e);
        }
    }

    public List<DocumentHistoryResponse> getDocumentHistory(Long documentId) {
        List<DocumentHistoryResponse> history = new ArrayList<>();
        Document current = getDocumentById(documentId);
        while (current != null) {
            history.add(new DocumentHistoryResponse(current.getId(), current.getDocumentType(), current.getOriginalFileName(), current.getStatus(), current.getRejectionReason(), current.getUploadedAt(), current.getUpdatedAt(), current.getPreviousDocument() == null ? null : current.getPreviousDocument().getId()));
            current = current.getPreviousDocument();
        }
        return history;
    }

    private void validateFile(MultipartFile file) {
        documentValidationService.validateUpload(file);
        if (file == null || file.isEmpty()) throw new RuntimeException("Document file is required");
        if (file.getSize() > 10 * 1024 * 1024) throw new RuntimeException("File size must not exceed 10 MB");
        String name = safeOriginalFileName(file);
        String ext = "";
        int dot = name.lastIndexOf('.');
        if (dot > 0 && dot < name.length() - 1) ext = name.substring(dot + 1).toLowerCase();
        if (!List.of("pdf", "jpg", "jpeg", "png").contains(ext))
            throw new RuntimeException("Only PDF, JPG, JPEG and PNG files are allowed");
    }

    private String safeOriginalFileName(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name != null) name = Paths.get(name).getFileName().toString();
        if (name == null || name.isBlank()) throw new RuntimeException("Invalid file name");
        return name;
    }

    private String fingerprint(MultipartFile file) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(file.getBytes()));
        } catch (NoSuchAlgorithmException | IOException e) {
            throw new RuntimeException("Could not fingerprint document", e);
        }
    }
}
