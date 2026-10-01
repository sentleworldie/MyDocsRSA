CREATE DATABASE document_verification;

USE document_verification;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'POLICE_OFFICER', 'ADMIN') NOT NULL DEFAULT 'USER',
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    document_type ENUM(
        'IDENTITY_DOCUMENT',
        'DRIVERS_LICENSE',
        'BIRTH_CERTIFICATE',
        'MATRIC_CERTIFICATE'
    ) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    status ENUM(
        'PENDING',
        'UNDER_POLICE_REVIEW',
        'CERTIFIED',
        'UNDER_ADMIN_REVIEW',
        'APPROVED',
        'REJECTED'
    ) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE certification_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    officer_id BIGINT NOT NULL,
    action ENUM('CERTIFIED', 'REJECTED') NOT NULL,
    reason TEXT,
    certified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (document_id) REFERENCES documents(id)
        ON DELETE CASCADE,

    FOREIGN KEY (officer_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE verification_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    admin_id BIGINT NOT NULL,
    action ENUM('APPROVED', 'REJECTED') NOT NULL,
    reason TEXT,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (document_id) REFERENCES documents(id)
        ON DELETE CASCADE,

    FOREIGN KEY (admin_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE copy_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status ENUM(
        'PENDING',
        'PROCESSING',
        'COMPLETED',
        'REJECTED'
    ) NOT NULL DEFAULT 'PENDING',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,

    FOREIGN KEY (document_id) REFERENCES documents(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

USE document_verification;

ALTER TABLE users
ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;


USE document_verification;

ALTER TABLE documents 
ADD COLUMN original_file_name VARCHAR(255) NOT NULL,
ADD COLUMN stored_file_name VARCHAR(255) NOT NULL,
ADD COLUMN updated_at DATETIME(6);

