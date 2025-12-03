CREATE TABLE contact_messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name     VARCHAR(100) NOT NULL,
    last_name      VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL,
    telephone      VARCHAR(50),
    message        TEXT NOT NULL,
    agreed_terms   TINYINT(1) NOT NULL DEFAULT 0,
    is_read        TINYINT(1) NOT NULL DEFAULT 0,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
