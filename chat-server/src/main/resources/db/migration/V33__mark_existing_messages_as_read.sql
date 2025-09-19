-- 기존 메시지들을 모두 읽음 처리하여 뱃지 초기화
UPDATE chat_message SET is_read = true WHERE is_read = false;
