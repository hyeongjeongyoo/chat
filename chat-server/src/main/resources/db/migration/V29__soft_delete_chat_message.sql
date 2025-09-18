-- Soft delete support for chat_message

ALTER TABLE `chat_message`
ADD COLUMN IF NOT EXISTS `deleted_yn` CHAR(1) NOT NULL DEFAULT 'N' COMMENT '삭제 여부 (Y/N)';

ALTER TABLE `chat_message`
ADD COLUMN IF NOT EXISTS `deleted_at` DATETIME NULL COMMENT '삭제 일시';

ALTER TABLE `chat_message`
ADD COLUMN IF NOT EXISTS `deleted_by` VARCHAR(64) NULL COMMENT '삭제자';

-- Backfill
UPDATE `chat_message`
SET
    `deleted_yn` = 'N'
WHERE
    `deleted_yn` IS NULL;

-- Helpful index for listing
CREATE INDEX IF NOT EXISTS `idx_chat_message_thread_deleted_created` ON `chat_message` (
    `thread_id`,
    `deleted_yn`,
    `created_at`
);