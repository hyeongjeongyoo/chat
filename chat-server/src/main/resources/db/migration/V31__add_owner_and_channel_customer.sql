-- Add owner_user_uuid to chat_channel and case-insensitive unique index for cms_code
ALTER TABLE chat_channel
ADD COLUMN IF NOT EXISTS owner_user_uuid CHAR(36) NULL AFTER cms_name;

-- For case-insensitive unique constraint on cms_code
-- Use generated column for LOWER(cms_code) since functional indexes may not be available in target MariaDB
ALTER TABLE chat_channel
ADD COLUMN IF NOT EXISTS cms_code_ci VARCHAR(50) GENERATED ALWAYS AS (LOWER(cms_code)) STORED;

-- Ensure unique index on case-insensitive code
CREATE UNIQUE INDEX IF NOT EXISTS ux_chat_channel_code_ci ON chat_channel (cms_code_ci);

-- Optional index for owner lookup
CREATE INDEX IF NOT EXISTS idx_chat_channel_owner_uuid ON chat_channel (owner_user_uuid);

-- Channel customer preset table
CREATE TABLE IF NOT EXISTS chat_channel_customer (
    id BIGINT NOT NULL AUTO_INCREMENT,
    channel_id BIGINT NOT NULL,
    user_uuid CHAR(36) NOT NULL,
    note VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_chat_channel_customer PRIMARY KEY (id),
    CONSTRAINT fk_chat_channel_customer_channel FOREIGN KEY (channel_id) REFERENCES chat_channel (id),
    CONSTRAINT uk_chat_channel_customer UNIQUE (channel_id, user_uuid)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX IF NOT EXISTS idx_chat_channel_customer_channel ON chat_channel_customer (channel_id);

CREATE INDEX IF NOT EXISTS idx_chat_channel_customer_user ON chat_channel_customer (user_uuid);


