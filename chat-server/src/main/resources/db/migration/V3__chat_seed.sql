-- Seed data for chat verification

-- 1) Channel
INSERT INTO
    chat_channel (
        cms_code,
        cms_name,
        created_by
    )
VALUES ('TEST', 'Test CMS', 'system')
ON DUPLICATE KEY UPDATE
    cms_name = VALUES(cms_name);

-- 2) Thread for dummy visitor
INSERT INTO
    chat_thread (
        channel_id,
        user_identifier,
        user_name,
        user_ip,
        created_by
    )
SELECT id, 'dummy-visitor', '방문자', '127.0.0.1', 'system'
FROM chat_channel
WHERE
    cms_code = 'TEST'
ON DUPLICATE KEY UPDATE
    user_name = VALUES(user_name);

-- 3) Messages
INSERT INTO
    chat_message (
        thread_id,
        sender_type,
        message_type,
        content,
        is_read,
        created_by
    )
SELECT t.id, 'USER', 'TEXT', '안녕하세요! 문의드립니다.', 0, 'system'
FROM chat_thread t
    JOIN chat_channel c ON c.id = t.channel_id
WHERE
    c.cms_code = 'TEST'
    AND t.user_identifier = 'dummy-visitor'
LIMIT 1;

INSERT INTO
    chat_message (
        thread_id,
        sender_type,
        message_type,
        content,
        is_read,
        created_by
    )
SELECT t.id, 'ADMIN', 'TEXT', '안녕하세요! 무엇을 도와드릴까요?', 0, 'system'
FROM chat_thread t
    JOIN chat_channel c ON c.id = t.channel_id
WHERE
    c.cms_code = 'TEST'
    AND t.user_identifier = 'dummy-visitor'
LIMIT 1;