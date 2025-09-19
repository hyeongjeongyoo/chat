-- Add CASCADE DELETE to foreign key constraints
-- This allows related records to be automatically deleted when parent records are deleted

-- 1. Fix chat_message foreign key constraint
ALTER TABLE chat_message DROP FOREIGN KEY fk_chat_message_thread;

ALTER TABLE chat_message
ADD CONSTRAINT fk_chat_message_thread FOREIGN KEY (thread_id) REFERENCES chat_thread (id) ON UPDATE RESTRICT ON DELETE CASCADE;

-- 2. Fix chat_channel_customer foreign key constraint
ALTER TABLE chat_channel_customer
DROP FOREIGN KEY fk_chat_channel_customer_channel;

ALTER TABLE chat_channel_customer
ADD CONSTRAINT fk_chat_channel_customer_channel FOREIGN KEY (channel_id) REFERENCES chat_channel (id) ON UPDATE RESTRICT ON DELETE CASCADE;

-- 3. Fix chat_thread foreign key constraint
ALTER TABLE chat_thread DROP FOREIGN KEY fk_chat_thread_channel;

ALTER TABLE chat_thread
ADD CONSTRAINT fk_chat_thread_channel FOREIGN KEY (channel_id) REFERENCES chat_channel (id) ON UPDATE RESTRICT ON DELETE CASCADE;
