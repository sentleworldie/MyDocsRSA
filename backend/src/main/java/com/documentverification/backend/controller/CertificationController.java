package com.documentverification.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.documentverification.backend.dto.CertificationRequestResponse;
import com.documentverification.backend.dto.CredentialResponse;
import com.documentverification.backend.entity.CertificationRequest;
import com.documentverification.backend.entity.DigitalCredential;
import com.documentverification.backend.entity.DocumentType;
import com.documentverification.backend.entity.Role;
import com.documentverification.backend.entity.User;
import com.documentverification.backend.repository.UserRepository;
import com.documentverification.backend.service.CertificationService;

import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/certification")
public class CertificationController {
    private final CertificationService certificationService;
    private final UserRepository userRepository;

    /**

     * Performs the operation represented by this method.

     */

    public CertificationController(CertificationService certificationService, UserRepository userRepository) {
        this.certificationService = certificationService;
        this.userRepository = userRepository;
    }

    @PostMapping("/requests")
    /**

     * Accepts a document certification request from a normal user, including the document type, certified-copy flag and uploaded file.

     */

    public ResponseEntity<?> createRequest(@RequestParam DocumentType documentType,
                                            @RequestParam boolean hasCertifiedCopy,
                                            @RequestParam MultipartFile file,
                                            Authentication authentication) {
        try {
            User user = currentUser(authentication);
            if (user.getRole() != Role.USER) return forbidden();
            Object result = certificationService.createRequest(user.getId(), documentType, hasCertifiedCopy, file);
            if (result instanceof DigitalCredential credential) {
                return ResponseEntity.ok(Map.of(
                        "message", "This document already has a valid digital credential",
                        "reused", true,
                        "credential", CredentialResponse.from(credential)));
            }
            CertificationRequest request = (CertificationRequest) result;
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Certification request submitted",
                    "reused", false,
                    "request", CertificationRequestResponse.from(request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/requests/me")
    /**

     * Returns the logged-in user's previous certification requests so the mobile app can show their certification progress and history.

     */

    public ResponseEntity<?> myRequests(Authentication authentication) {
        try {
            User user = currentUser(authentication);
            return ResponseEntity.ok(certificationService.getRequestsForUser(user.getId()).stream()
                    .map(CertificationRequestResponse::from).toList());
        } catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @GetMapping("/requests/pending")
    /**

     * Returns certification requests waiting for police/admin processing so officers can see work that needs attention.

     */

    public ResponseEntity<?> pending(Authentication authentication) {
        if (!isOfficerOrAdmin(authentication)) return forbidden();
        return ResponseEntity.ok(certificationService.getPendingRequests().stream().map(CertificationRequestResponse::from).toList());
    }

    @PutMapping("/requests/{id}/review")
    /**

     * Moves a certification request into the review stage when an authorised officer or administrator starts processing it.

     */

    public ResponseEntity<?> review(@PathVariable Long id, Authentication authentication) {
        if (!isOfficerOrAdmin(authentication)) return forbidden();
        try { return ResponseEntity.ok(CertificationRequestResponse.from(certificationService.startReview(id))); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @PutMapping("/requests/{id}/approve")
    /**

     * Approves a certification request and allows the service to create or update the user's digital credential.

     */

    public ResponseEntity<?> approve(@PathVariable Long id, Authentication authentication) {
        if (!isOfficerOrAdmin(authentication)) return forbidden();
        try {
            CertificationRequest request = certificationService.approve(id);
            List<DigitalCredential> credentials = certificationService.getUserCredentials(request.getUser().getId());
            DigitalCredential credential = credentials.stream()
                    .filter(c -> c.getDocument().getId().equals(request.getDocument().getId()))
                    .findFirst().orElseThrow(() -> new RuntimeException("Credential was not created"));
            return ResponseEntity.ok(Map.of("message", "Certification approved", "request", CertificationRequestResponse.from(request), "credential", CredentialResponse.from(credential)));
        } catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    /**


     * Handles the ReasonRequest operation used by the MyDocs RSA backend.


     */


    public record ReasonRequest(@NotBlank String reason) {}

    @PutMapping("/requests/{id}/reject")
    /**

     * Rejects a certification request and records the reason so the user can understand why the document was not accepted.

     */

    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody ReasonRequest body, Authentication authentication) {
        if (!isOfficerOrAdmin(authentication)) return forbidden();
        try { return ResponseEntity.ok(CertificationRequestResponse.from(certificationService.reject(id, body.reason()))); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @PutMapping("/requests/{id}/more-information")
    /**

     * Marks a certification request as requiring more information or a new submission from the user.

     */

    public ResponseEntity<?> moreInformation(@PathVariable Long id, @RequestBody ReasonRequest body, Authentication authentication) {
        if (!isOfficerOrAdmin(authentication)) return forbidden();
        try { return ResponseEntity.ok(CertificationRequestResponse.from(certificationService.requestMoreInformation(id, body.reason()))); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @GetMapping("/credentials/me")
    /**

     * Returns the digital credentials belonging to the logged-in user for display in the MyDocs RSA digital wallet.

     */

    public ResponseEntity<?> myCredentials(Authentication authentication) {
        try {
            User user = currentUser(authentication);
            return ResponseEntity.ok(certificationService.getUserCredentials(user.getId()).stream().map(CredentialResponse::from).toList());
        } catch (RuntimeException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @GetMapping("/credentials/{credentialId}")
    /**

     * Returns one digital credential only when it belongs to the authenticated user.

     */

    public ResponseEntity<?> credential(@PathVariable Long credentialId, Authentication authentication) {
        try {
            User user = currentUser(authentication);
            DigitalCredential c = certificationService.getCredentialForUser(credentialId, user.getId());
            return ResponseEntity.ok(CredentialResponse.from(c));
        } catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage())); }
    }

    /**


     * Looks up a credential by its verification code so the system can confirm whether a MyDocs RSA credential is valid.


     */


    public ResponseEntity<?> verifyCredential(@PathVariable String verificationCode, Authentication authentication) {
        if (!isOfficerOrAdmin(authentication)) return forbidden();
        try {
            DigitalCredential c = certificationService.verifyCredential(verificationCode);
            return ResponseEntity.ok(Map.of(
                    "valid", c.getStatus().name().equals("ACTIVE"),
                    "status", c.getStatus().name(),
                    "credentialId", c.getId(),
                    "documentType", c.getDocument().getDocumentType().name(),
                    "documentId", c.getDocument().getId(),
                    "holderName", c.getUser().getFullName(),
                    "validUntil", c.getValidUntil()));
        } catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("valid", false, "message", e.getMessage())); }
    }

    /**


     * Loads the MyDocs RSA user represented by the authenticated JWT email.


     */


    private User currentUser(Authentication a) { return userRepository.findByEmail(a.getName()).orElseThrow(() -> new RuntimeException("Authenticated user not found")); }
    /**

     * Checks whether the authenticated account has a police officer or administrator role for protected certification actions.

     */

    private boolean isOfficerOrAdmin(Authentication a) {
        if (a == null || a.getAuthorities() == null) return false;
        return a.getAuthorities().stream().anyMatch(x -> x.getAuthority().equals("ROLE_POLICE_OFFICER") || x.getAuthority().equals("ROLE_ADMIN"));
    }
    /**

     * Builds the standard response used when a user tries to access a certification operation outside their role.

     */

    private ResponseEntity<Map<String, String>> forbidden() { return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "You are not allowed to access this endpoint")); }
}
