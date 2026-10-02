package com.documentverification.backend.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;

import com.documentverification.backend.entity.Document;
import com.documentverification.backend.entity.VerificationStatus;
import com.documentverification.backend.repository.DocumentRepository;

@Service
public class VerificationService {

    private static final Logger logger =
            LoggerFactory.getLogger(VerificationService.class);

    private final DocumentRepository documentRepository;
    private final EmailService emailService;

    public VerificationService(
            DocumentRepository documentRepository,
            EmailService emailService) {

        this.documentRepository = documentRepository;
        this.emailService = emailService;
    }

    // ============================================================
    // GET PENDING DOCUMENTS
    // ============================================================

    public List<Document> getPendingDocuments() {

        return documentRepository.findByStatus(
                VerificationStatus.PENDING
        );
    }

    // ============================================================
    // START REVIEW
    // ============================================================

    public Document startReview(Long documentId) {

        Document document = getDocument(documentId);

        if (document.getStatus() != VerificationStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending documents can be placed under review"
            );
        }

        document.setStatus(VerificationStatus.UNDER_REVIEW);

        return documentRepository.save(document);
    }

    // ============================================================
    // APPROVE DOCUMENT
    // ============================================================

    public Document approveDocument(Long documentId) {

        Document document = getDocument(documentId);

        if (document.getStatus() != VerificationStatus.UNDER_REVIEW) {

            throw new RuntimeException(
                    "Only documents under review can be approved"
            );
        }

        document.setStatus(VerificationStatus.APPROVED);

        document.setRejectionReason(null);

        Document savedDocument = documentRepository.save(document);

        sendNotification(
                savedDocument,
                "Your document has been approved",
                """
                Hello,
                
                Your document has been successfully approved.
                
                Document type: """ + savedDocument.getDocumentType() + "\n" +
                "Document ID: " + savedDocument.getId() + "\n" +
                "Status: APPROVED\n\n" +
                "You can now log in to MyDocs RSA to view your document.\n\n" +
                "Regards,\n" +
                "MyDocs RSA"
        );

        return savedDocument;
    }

    // ============================================================
    // REJECT DOCUMENT
    // ============================================================

    public Document rejectDocument(
            Long documentId,
            String reason) {

        Document document = getDocument(documentId);

        if (document.getStatus() != VerificationStatus.UNDER_REVIEW) {

            throw new RuntimeException(
                    "Only documents under review can be rejected"
            );
        }

        if (reason == null || reason.isBlank()) {

            throw new RuntimeException(
                    "A rejection reason is required"
            );
        }

        document.setStatus(VerificationStatus.REJECTED);

        document.setRejectionReason(reason);

        Document savedDocument = documentRepository.save(document);

        sendNotification(
                savedDocument,
                "Your document verification was unsuccessful",
                """
                Hello,
                
                Unfortunately, your document was rejected.
                
                Document type: """ + savedDocument.getDocumentType() + "\n" +
                "Document ID: " + savedDocument.getId() + "\n" +
                "Status: REJECTED\n\n" +
                "Reason:\n" + reason + "\n\n" +
                "Please review the reason and submit a corrected document if required.\n\n" +
                "Regards,\n" +
                "MyDocs RSA"
        );

        return savedDocument;
    }

    // ============================================================
    // REQUEST RESUBMISSION
    // ============================================================

    public Document requestResubmission(
            Long documentId,
            String reason) {

        Document document = getDocument(documentId);

        if (document.getStatus() != VerificationStatus.UNDER_REVIEW) {

            throw new RuntimeException(
                    "Only documents under review can require resubmission"
            );
        }

        if (reason == null || reason.isBlank()) {

            throw new RuntimeException(
                    "A reason for resubmission is required"
            );
        }

        document.setStatus(
                VerificationStatus.RESUBMISSION_REQUIRED
        );

        document.setRejectionReason(reason);

        Document savedDocument = documentRepository.save(document);

        sendNotification(
                savedDocument,
                "Action required: Please resubmit your document",
                """
                Hello,
                
                Your document requires correction and resubmission.
                
                Document type: """ + savedDocument.getDocumentType() + "\n" +
                "Document ID: " + savedDocument.getId() + "\n" +
                "Status: RESUBMISSION REQUIRED\n\n" +
                "Reason:\n" + reason + "\n\n" +
                "Please log in to MyDocs RSA and upload a corrected document.\n\n" +
                "Regards,\n" +
                "MyDocs RSA"
        );

        return savedDocument;
    }

    // ============================================================
    // SEND NOTIFICATION
    // ============================================================

    private void sendNotification(
            Document document,
            String subject,
            String message) {

        try {

            String recipient = document.getUser().getEmail();

            emailService.sendDocumentStatusEmail(
                    recipient,
                    subject,
                    message
            );

            logger.info(
                    "Notification sent for document ID {}",
                    document.getId()
            );

        } catch (MailException | IllegalStateException e) {

            logger.error(
                    "Document status was saved, but email notification failed for document ID {}",
                    document.getId(),
                    e
            );
        }
    }

    // ============================================================
    // FIND DOCUMENT
    // ============================================================

    private Document getDocument(Long documentId) {

        return documentRepository.findById(documentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Document not found"
                        )
                );
    }
}