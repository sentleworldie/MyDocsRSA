package com.documentverification.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.documentverification.backend.entity.CertificationRequest;
import com.documentverification.backend.entity.CertificationRequestStatus;
import com.documentverification.backend.entity.User;

public interface CertificationRequestRepository extends JpaRepository<CertificationRequest, Long> {
    List<CertificationRequest> findByUserOrderByCreatedAtDesc(User user);
    List<CertificationRequest> findByStatusOrderByCreatedAtAsc(CertificationRequestStatus status);
}
