package com.documentverification.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.documentverification.backend.dto.CertificationRequestResponse;
import com.documentverification.backend.entity.CertificationRequest;
import com.documentverification.backend.entity.CertificationRequestStatus;
import com.documentverification.backend.entity.DigitalCredential;
import com.documentverification.backend.entity.Document;
import com.documentverification.backend.entity.DocumentType;
import com.documentverification.backend.entity.ProcessingPath;
import com.documentverification.backend.entity.User;
import com.documentverification.backend.repository.CertificationRequestRepository;
import com.documentverification.backend.repository.DigitalCredentialRepository;
import com.documentverification.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;

@Service
public class CertificationService {
    private final CertificationRequestRepository requestRepository;
    private final DigitalCredentialRepository credentialRepository;
    private final UserRepository userRepository;
    private final DocumentService documentService;
    private final int validityMonths;

    public CertificationService(CertificationRequestRepository requestRepository,
                                DigitalCredentialRepository credentialRepository,
                                UserRepository userRepository,
                                DocumentService documentService,
                                @Value("${app.credential.validity-months:6}") int validityMonths) {
        this.requestRepository = requestRepository;
        this.credentialRepository = credentialRepository;
        this.userRepository = userRepository;
        this.documentService = documentService;
        this.validityMonths = Math.max(3, Math.min(validityMonths, 6));
    }

    /**


     * Creates a certification request, or reuses an active credential when the exact same previously verified document is submitted again.


     */


    public Object createRequest(Long userId, DocumentType type, boolean hasCertifiedCopy, MultipartFile file) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // If this exact previously-verified file already has an active credential,
        // return the existing credential instead of sending it through verification again.
        String fingerprint = fingerprint(file);
        for (DigitalCredential c : credentialRepository.findByUserOrderByIssuedAtDesc(user)) {
            if (c.getDocument().getDocumentType() == type
                    && c.getDocument().getFileFingerprint() != null
                    && c.getDocument().getFileFingerprint().equals(fingerprint)
                    && c.getStatus() == com.documentverification.backend.entity.CredentialStatus.ACTIVE
                    && c.getValidUntil().isAfter(java.time.LocalDateTime.now())) {
                return c;
            }
        }

        Document document = documentService.uploadDocument(userId, type, file, hasCertifiedCopy);
        CertificationRequest request = new CertificationRequest();
        request.setUser(user);
        request.setDocument(document);
        request.setHasCertifiedCopy(hasCertifiedCopy);
        request.setProcessingPath(hasCertifiedCopy ? ProcessingPath.FAST_TRACK_CERTIFIED_COPY : ProcessingPath.INVESTIGATION_REQUIRED);
        request.setStatus(CertificationRequestStatus.SUBMITTED);
        return requestRepository.save(request);
    }

    /**


     * Returns certification requests belonging to one MyDocs RSA user, ordered for display as their request history.


     */


    public List<CertificationRequest> getRequestsForUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return requestRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**


     * Returns certification requests waiting for officer/admin action.


     */


    public List<CertificationRequest> getPendingRequests() {
        return requestRepository.findByStatusOrderByCreatedAtAsc(CertificationRequestStatus.SUBMITTED);
    }

    /**


     * Moves a certification request into review so an authorised officer can process it.


     */


    public CertificationRequest startReview(Long id) {
        CertificationRequest r = getRequest(id);
        if (r.getStatus() != CertificationRequestStatus.SUBMITTED && r.getStatus() != CertificationRequestStatus.INVESTIGATION_REQUIRED)
            throw new RuntimeException("Request is not awaiting review");
        r.setStatus(CertificationRequestStatus.UNDER_REVIEW);
        r.getDocument().setStatus(com.documentverification.backend.entity.VerificationStatus.UNDER_REVIEW);
        r.touch();
        return requestRepository.save(r);
    }

    /**


     * Approves the certification request and creates or activates the digital credential linked to the verified document.


     */


    public CertificationRequest approve(Long id) {
        CertificationRequest r = getRequest(id);
        if (r.getStatus() != CertificationRequestStatus.UNDER_REVIEW)
            throw new RuntimeException("Only requests under review can be approved");
        r.setStatus(CertificationRequestStatus.APPROVED);
        r.getDocument().setStatus(com.documentverification.backend.entity.VerificationStatus.APPROVED);
        r.getDocument().setRejectionReason(null);
        r.touch();
        requestRepository.save(r);

        DigitalCredential credential = credentialRepository.findByDocument(r.getDocument()).orElseGet(DigitalCredential::new);
        credential.setUser(r.getUser());
        credential.setDocument(r.getDocument());
        credential.setStatus(com.documentverification.backend.entity.CredentialStatus.ACTIVE);
        credential.setIssuedAt(java.time.LocalDateTime.now());
        credential.setValidUntil(java.time.LocalDateTime.now().plusMonths(validityMonths));
        credential.setRevokedAt(null); credential.setRevocationReason(null);
        return credentialRepository.save(credential).getId() != null ? r : r;
    }

    /**


     * Rejects a certification request and records the reason provided by the reviewing officer.


     */


    public CertificationRequest reject(Long id, String reason) {
        if (reason == null || reason.isBlank()) throw new RuntimeException("A rejection reason is required");
        CertificationRequest r = getRequest(id);
        if (r.getStatus() != CertificationRequestStatus.UNDER_REVIEW) throw new RuntimeException("Only requests under review can be rejected");
        r.setStatus(CertificationRequestStatus.REJECTED);
        r.getDocument().setStatus(com.documentverification.backend.entity.VerificationStatus.REJECTED);
        r.getDocument().setRejectionReason(reason);
        r.setNotes(reason); r.touch();
        return requestRepository.save(r);
    }

    /**


     * Marks the certification request as needing more information or another submission from the user.


     */


    public CertificationRequest requestMoreInformation(Long id, String reason) {
        if (reason == null || reason.isBlank()) throw new RuntimeException("A reason is required");
        CertificationRequest r = getRequest(id);
        if (r.getStatus() != CertificationRequestStatus.UNDER_REVIEW) throw new RuntimeException("Only requests under review can request more information");
        r.setStatus(CertificationRequestStatus.RESUBMISSION_REQUIRED);
        r.getDocument().setStatus(com.documentverification.backend.entity.VerificationStatus.RESUBMISSION_REQUIRED);
        r.getDocument().setRejectionReason(reason);
        r.setNotes(reason); r.touch();
        return requestRepository.save(r);
    }

    /**


     * Returns a specific digital credential only when it belongs to the requesting MyDocs RSA user.


     */


    public DigitalCredential getCredentialForUser(Long credentialId, Long userId) {
        DigitalCredential c = credentialRepository.findById(credentialId).orElseThrow(() -> new RuntimeException("Credential not found"));
        if (!c.getUser().getId().equals(userId)) throw new RuntimeException("You are not allowed to access this credential");
        refreshExpiry(c); return c;
    }

    /**


     * Returns the user's digital credentials for the MyDocs RSA wallet.


     */


    public List<DigitalCredential> getUserCredentials(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<DigitalCredential> list = credentialRepository.findByUserOrderByIssuedAtDesc(user);
        list.forEach(this::refreshExpiry);
        return list;
    }

    /**


     * Finds a credential by verification code and refreshes its status based on its validity period.


     */


    public DigitalCredential verifyCredential(String code) {
        DigitalCredential c = credentialRepository.findByVerificationCode(code)
                .orElseThrow(() -> new RuntimeException("Credential not found"));
        refreshExpiry(c);
        return c;
    }

    /**


     * Changes an active credential to EXPIRED when its six-month validity period has passed.


     */


    private void refreshExpiry(DigitalCredential c) {
        if (c.getStatus() == com.documentverification.backend.entity.CredentialStatus.ACTIVE
                && c.getValidUntil() != null && c.getValidUntil().isBefore(java.time.LocalDateTime.now())) {
            c.setStatus(com.documentverification.backend.entity.CredentialStatus.EXPIRED);
            credentialRepository.save(c);
        }
    }

    /**


     * Loads a certification request by ID or reports that the requested request does not exist.


     */


    private CertificationRequest getRequest(Long id) {
        return requestRepository.findById(id).orElseThrow(() -> new RuntimeException("Certification request not found"));
    }

    /**


     * Creates a SHA-256 fingerprint of the uploaded document so MyDocs RSA can recognise an identical previously verified file.


     */


    private String fingerprint(MultipartFile file) {
        try {
            var digest = java.security.MessageDigest.getInstance("SHA-256");
            return java.util.HexFormat.of().formatHex(digest.digest(file.getBytes()));
        } catch (Exception e) { throw new RuntimeException("Could not fingerprint document", e); }
    }
}
