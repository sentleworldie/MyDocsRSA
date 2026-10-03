package com.documentverification.backend.dto;

import com.documentverification.backend.entity.DocumentType;

import jakarta.validation.constraints.NotNull;

public record CertificationRequestInput(@NotNull DocumentType documentType, boolean hasCertifiedCopy) {}
