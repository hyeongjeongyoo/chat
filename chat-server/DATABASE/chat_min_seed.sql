-- chat_min_seed.sql
-- 채팅 기능 최소 시드 데이터

USE cs_manager;

-- 채널 시드
INSERT INTO
    chat_channel (
        cms_code,
        cms_name,
        created_by,
        created_ip
    )
VALUES (
        'CMS-DEFAULT',
        '기본 채널',
        'system',
        '127.0.0.1'
    )
ON DUPLICATE KEY UPDATE
    cms_name = VALUES(cms_name);

-- 스레드 시드 (채널 id=1 가정; 환경에 따라 SELECT로 치환 가능)
INSERT INTO
    chat_thread (
        channel_id,
        user_identifier,
        user_name,
        user_ip,
        created_by,
        created_ip
    )
VALUES (
        1,
        'user-001',
        '방문자A',
        '127.0.0.1',
        'system',
        '127.0.0.1'
    )
ON DUPLICATE KEY UPDATE
    user_name = VALUES(user_name);

-- 메시지 시드
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
VALUES (
        1,
        'ADMIN',
        '관리자',
        'TEXT',
        '안녕하세요 (로컬 세팅 테스트)',
        0,
        'system',
        '127.0.0.1'
    );