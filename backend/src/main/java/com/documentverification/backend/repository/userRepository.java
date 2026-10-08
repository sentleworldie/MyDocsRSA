package com.documentverification.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.documentverification.backend.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    /**

     * Checks whether the specified MyDocs RSA document relationship already exists.

     */

    boolean existsByEmail(String email);
}