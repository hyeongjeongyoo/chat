-- chat_min_schema.sql
-- 프로젝트 채팅 기능 최소 스키마 (MariaDB/MySQL)
-- 테이블: chat_channel, chat_thread, chat_message, file

-- 0) 데이터베이스
CREATE DATABASE IF NOT EXISTS cs_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE cs_manager;

-- 1) 채널
CREATE TABLE IF NOT EXISTS chat_channel (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cms_code VARCHAR(50) NOT NULL,
    cms_name VARCHAR(100),
    created_by VARCHAR(50),
    created_ip VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_ip VARCHAR(50),
    UNIQUE KEY uk_chat_channel_cms_code (cms_code),
    KEY idx_chat_channel_cms_code (cms_code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 2) 스레드
CREATE TABLE IF NOT EXISTS chat_thread (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    channel_id BIGINT NOT NULL,
    user_identifier VARCHAR(255) NOT NULL,
    user_name VARCHAR(100),
    user_ip VARCHAR(50),
    created_by VARCHAR(50),
    created_ip VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_ip VARCHAR(50),
    UNIQUE KEY uk_chat_thread_channel_user (channel_id, user_identifier),
    KEY idx_chat_thread_channel_id (channel_id),
    KEY idx_chat_thread_user_identifier (user_identifier),
    CONSTRAINT fk_chat_thread_channel FOREIGN KEY (channel_id) REFERENCES chat_channel (id) ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 3) 메시지
CREATE TABLE IF NOT EXISTS chat_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    thread_id BIGINT NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    message_type VARCHAR(20) NOT NULL,
    content TEXT,
    file_name VARCHAR(255),
    file_url VARCHAR(512),
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    read_at DATETIME NULL,
    created_by VARCHAR(50),
    created_ip VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_ip VARCHAR(50),
    KEY idx_chat_message_thread_id (thread_id),
    KEY idx_chat_message_created_at (created_at),
    CONSTRAINT fk_chat_message_thread FOREIGN KEY (thread_id) REFERENCES chat_thread (id) ON UPDATE RESTRICT ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 4) 파일(첨부)
CREATE TABLE IF NOT EXISTS file (
    file_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    menu VARCHAR(30) NOT NULL,
    menu_id BIGINT NOT NULL,
    origin_name VARCHAR(255) NOT NULL,
    saved_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    ext VARCHAR(20) NOT NULL,
    version INT DEFAULT 1,
    public_yn CHAR(1) DEFAULT 'Y',
    file_order INT DEFAULT 0,
    message_id BIGINT NULL,
    created_by VARCHAR(36),
    created_ip VARCHAR(45),
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(36),
    updated_ip VARCHAR(45),
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_file_saved_name (saved_name),
    KEY idx_file_message_id (message_id)
    -- 필요 시 FK 추가 가능:
    -- , CONSTRAINT fk_file_message FOREIGN KEY (message_id) REFERENCES chat_message(id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;