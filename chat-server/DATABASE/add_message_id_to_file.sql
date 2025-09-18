-- Add message_id column to link files to chat messages
-- Safe to run multiple times: checks existence before adding

-- MySQL/MariaDB
SET
    @col_exists := (
        SELECT COUNT(*)
        FROM information_schema.COLUMNS
        WHERE
            TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'file'
            AND COLUMN_NAME = 'message_id'
    );

SET
    @sql := IF(
        @col_exists = 0,
        'ALTER TABLE `file` ADD COLUMN `message_id` BIGINT NULL AFTER `file_order`, ADD INDEX `idx_file_message_id` (`message_id`);',
        'SELECT 1;'
    );

PREPARE stmt FROM @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;