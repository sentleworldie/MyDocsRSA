package com.documentverification.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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

    private final Path uploadDirectory = Paths.get("document-storage").toAbsolutePath().normalize();

    public DocumentService(
            DocumentRepository documentRepository,
            UserRepository userRepository) {

        this.documentRepository = documentRepository;
        this.userRepository = userRepository;

        try {
            Files.createDirectories(uploadDirectory);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not create document storage directory", e);
        }
    }

    public Document uploadDocument(
            Long userId,
            DocumentType documentType,
            MultipartFile file) {

        // Check that a file was provided
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Document file is required");
        }

        // Maximum file size: 10 MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException(
                    "File size must not exceed 10 MB");
        }

        // Get the original file name
        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null || originalFileName.isBlank()) {
            throw new RuntimeException("Invalid file name");
        }

        // Validate file extension
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

        // Find the user who is uploading the document
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate a unique name for storing the file
        String storedFileName = UUID.randomUUID() + "_" + originalFileName;

        Path targetLocation = uploadDirectory
                .resolve(storedFileName)
                .normalize();

        // Store the file
        try {

            Files.copy(
                    file.getInputStream(),
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Could not store document", e);
        }

        // Create the document database record
        Document document = new Document();

        document.setUser(user);
        document.setDocumentName(originalFileName);
        document.setDocumentType(documentType);
        document.setStatus(VerificationStatus.PENDING);
        document.setOriginalFileName(originalFileName);
        document.setStoredFileName(storedFileName);
        document.setFilePath(targetLocation.toString());

        // Save the document to MySQL
        return documentRepository.save(document);
    }
}