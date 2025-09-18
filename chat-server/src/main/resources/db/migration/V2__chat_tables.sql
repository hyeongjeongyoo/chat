-- Chat tables migration (context7 spec)

-- chat_channel
CREATE TABLE IF NOT EXISTS chat_channel (
    id BIGINT NOT NULL AUTO_INCREMENT,
    cms_code VARCHAR(50) NOT NULL,
    cms_name VARCHAR(100),
    created_by VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_chat_channel PRIMARY KEY (id),
    CONSTRAINT uk_chat_channel_cms_code UNIQUE (cms_code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_chat_channel_cms_code ON chat_channel (cms_code);

-- chat_thread
CREATE TABLE IF NOT EXISTS chat_thread (
    id BIGINT NOT NULL AUTO_INCREMENT,
    channel_id BIGINT NOT NULL,
    user_identifier VARCHAR(255) NOT NULL,
    user_name VARCHAR(100),
    user_ip VARCHAR(50),
    created_by VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_chat_thread PRIMARY KEY (id),
    CONSTRAINT fk_chat_thread_channel FOREIGN KEY (channel_id) REFERENCES chat_channel (id),
    CONSTRAINT uk_chat_thread_channel_user UNIQUE (channel_id, user_identifier)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_chat_thread_channel_id ON chat_thread (channel_id);

CREATE INDEX idx_chat_thread_user_identifier ON chat_thread (user_identifier);

-- chat_message
CREATE TABLE IF NOT EXISTS chat_message (
    id BIGINT NOT NULL AUTO_INCREMENT,
    thread_id BIGINT NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    message_type VARCHAR(20) NOT NULL,
    content TEXT,
    file_name VARCHAR(255),
    file_url VARCHAR(512),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at DATETIME,
    created_by VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_chat_message PRIMARY KEY (id),
    CONSTRAINT fk_chat_message_thread FOREIGN KEY (thread_id) REFERENCES chat_thread (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_chat_message_thread_id ON chat_message (thread_id);

CREATE INDEX idx_chat_message_created_at ON chat_message (created_at);

-- chat_participant
CREATE TABLE IF NOT EXISTS chat_participant (
    id BIGINT NOT NULL AUTO_INCREMENT,
    thread_id BIGINT NOT NULL,
    user_identifier VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    joined_at DATETIME,
    left_at DATETIME,
    created_by VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_chat_participant PRIMARY KEY (id),
    CONSTRAINT fk_chat_participant_thread FOREIGN KEY (thread_id) REFERENCES chat_thread (id),
    CONSTRAINT uk_chat_participant_thread_user UNIQUE (thread_id, user_identifier)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_chat_participant_thread_id ON chat_participant (thread_id);

-- chat_session_log
CREATE TABLE IF NOT EXISTS chat_session_log (
    id BIGINT NOT NULL AUTO_INCREMENT,
    thread_id BIGINT NOT NULL,
    session_id VARCHAR(100),
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    ended_reason VARCHAR(100),
    CONSTRAINT pk_chat_session_log PRIMARY KEY (id),
    CONSTRAINT fk_chat_session_log_thread FOREIGN KEY (thread_id) REFERENCES chat_thread (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_chat_session_log_thread_id ON chat_session_log (thread_id);

CREATE INDEX idx_chat_session_log_started_at ON chat_session_log (started_at);

-- chat_setting
CREATE TABLE IF NOT EXISTS chat_setting (
    id BIGINT NOT NULL AUTO_INCREMENT,
    channel_id BIGINT NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `value` VARCHAR(1000),
    created_by VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_chat_setting PRIMARY KEY (id),
    CONSTRAINT fk_chat_setting_channel FOREIGN KEY (channel_id) REFERENCES chat_channel (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_chat_setting_channel_id ON chat_setting (channel_id);