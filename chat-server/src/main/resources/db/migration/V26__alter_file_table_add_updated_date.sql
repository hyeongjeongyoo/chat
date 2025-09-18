-- DB 선택 (필요 시 수정)
-- USE cs_manager;

SET @cms_code := 'DEFAULT';

SET @cms_name := 'Default';

SET @actor := 'admin';

-- 1) 채널(DEFAULT) 보장
INSERT INTO
    chat_channel (
        cms_code,
        cms_name,
        created_by
    )
SELECT @cms_code, @cms_name, @actor
WHERE
    NOT EXISTS (
        SELECT 1
        FROM chat_channel
        WHERE
            UPPER(cms_code) = UPPER(@cms_code)
    );

-- 2) 채널 ID 획득
SELECT id INTO @channel_id
FROM chat_channel
WHERE
    UPPER(cms_code) = UPPER(@cms_code)
LIMIT 1;

-- 3) threadId=10 생성 (없을 때만)
INSERT INTO
    chat_thread (
        id,
        channel_id,
        user_identifier,
        user_name,
        user_ip,
        created_by
    )
SELECT 10, @channel_id, 'popup-10-chat', 'POPUP', '127.0.0.1', @actor
WHERE
    NOT EXISTS (
        SELECT 1
        FROM chat_thread
        WHERE
            id = 10
    );

-- 4) (선택) chat_thread AUTO_INCREMENT 조정 (10보다 작게 설정되어 있으면 충돌 방지)
SET
    @next_ai := (
        SELECT GREATEST(COALESCE(MAX(id), 0) + 1, 11)
        FROM chat_thread
    );

SET
    @sql := CONCAT(
        'ALTER TABLE chat_thread AUTO_INCREMENT=',
        @next_ai
    );

PREPARE stmt FROM @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- 5) (선택) 초기 메시지 1개 삽입
INSERT INTO
    chat_message (
        thread_id,
        sender_type,
        sender_name,
        message_type,
        content,
        is_read,
        created_by,
        created_ip
    )
SELECT 10, 'ADMIN', COALESCE(@actor, 'admin'), 'TEXT', '테스트 스레드 초기화', 0, @actor, '127.0.0.1'
WHERE
    EXISTS (
        SELECT 1
        FROM chat_thread
        WHERE
            id = 10
    )
    AND NOT EXISTS (
        SELECT 1
        FROM chat_message
        WHERE
            thread_id = 10
        LIMIT 1
    );