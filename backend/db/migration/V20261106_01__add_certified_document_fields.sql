-- MySQL / MariaDB migration for automatic certified-copy stamping.
ALTER TABLE certification_requests
    ADD COLUMN certified_file_path VARCHAR(1024) NULL,
    ADD COLUMN certified_file_name VARCHAR(255) NULL,
    ADD COLUMN stamp_position VARCHAR(30) NULL;
