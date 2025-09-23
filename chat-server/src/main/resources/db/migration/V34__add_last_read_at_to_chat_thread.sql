-- ChatThread에 마지막 읽은 시간 필드 추가
ALTER TABLE chat_thread
ADD COLUMN last_read_at TIMESTAMP NULL AFTER updated_at;

-- 인덱스 추가
CREATE INDEX idx_chat_thread_last_read_at ON chat_thread (last_read_at);

