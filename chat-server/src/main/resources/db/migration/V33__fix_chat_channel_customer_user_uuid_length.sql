-- Fix user_uuid column length in chat_channel_customer table
-- Change from CHAR(36) to VARCHAR(50) to accommodate userIdentifier format

ALTER TABLE chat_channel_customer 
MODIFY COLUMN user_uuid VARCHAR(50) NOT NULL;
