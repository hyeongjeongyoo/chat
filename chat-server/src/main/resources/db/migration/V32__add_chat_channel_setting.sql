-- Chat channel settings table: basic structured columns for common rules
-- Using explicit columns for portability across MariaDB versions

CREATE TABLE IF NOT EXISTS chat_channel_setting (
    channel_id BIGINT NOT NULL,
    allow_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    auto_create_thread BOOLEAN NOT NULL DEFAULT TRUE,
    message_retention_days INT NOT NULL DEFAULT 90,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_chat_channel_setting PRIMARY KEY (channel_id),
    CONSTRAINT fk_chat_channel_setting_channel FOREIGN KEY (channel_id) REFERENCES chat_channel (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX IF NOT EXISTS idx_chat_channel_setting_channel ON chat_channel_setting (channel_id);


