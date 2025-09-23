-- Add soft delete fields to chat_channel table
-- This allows channels to be marked as deleted without physically removing them from the database

ALTER TABLE chat_channel
ADD COLUMN deleted_yn CHAR(1) NOT NULL DEFAULT 'N' AFTER updated_ip;

ALTER TABLE chat_channel
ADD COLUMN deleted_at TIMESTAMP NULL AFTER deleted_yn;

ALTER TABLE chat_channel
ADD COLUMN deleted_by VARCHAR(64) NULL AFTER deleted_at;

-- Add index for soft delete queries
CREATE INDEX idx_chat_channel_deleted_yn ON chat_channel (deleted_yn);

-- Add composite index for active channels lookup
CREATE INDEX idx_chat_channel_active ON chat_channel (deleted_yn, created_at);