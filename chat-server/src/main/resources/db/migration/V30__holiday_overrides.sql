-- Create holiday override table (supports legal/temporary/company holidays)
-- MySQL/MariaDB

CREATE TABLE IF NOT EXISTS holiday_override (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    holiday_date DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'PUBLIC', -- PUBLIC | COMPANY | TEMPORARY
    closed_yn CHAR(1) NOT NULL DEFAULT 'Y', -- Y: closed, N: open (force override)
    created_by VARCHAR(64),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(64),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_holiday_override_date_type (holiday_date, type),
    KEY idx_holiday_override_date (holiday_date)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;