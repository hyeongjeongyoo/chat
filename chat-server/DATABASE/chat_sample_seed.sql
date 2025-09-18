-- chat_sample_seed.sql
-- 채팅 기능 샘플 데이터(안전 멱등 시드)

USE cs_manager;

-- 1) 채널 샘플
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

SET
    @ch1 := (
        SELECT id
        FROM chat_channel
        WHERE
            cms_code = 'CMS-DEFAULT'
    );

-- 2) 스레드 샘플(방문자 2명)
INSERT INTO
    chat_thread (
        channel_id,
        user_identifier,
        user_name,
        user_ip,
        created_by,
        created_ip
    )
SELECT @ch1, 'visitor-001', '방문자A', '127.0.0.1', 'system', '127.0.0.1'
WHERE
    NOT EXISTS (
        SELECT 1
        FROM chat_thread
        WHERE
            channel_id = @ch1
            AND user_identifier = 'visitor-001'
    );

INSERT INTO
    chat_thread (
        channel_id,
        user_identifier,
        user_name,
        user_ip,
        created_by,
        created_ip
    )
SELECT @ch1, 'visitor-002', '방문자B', '127.0.0.1', 'system', '127.0.0.1'
WHERE
    NOT EXISTS (
        SELECT 1
        FROM chat_thread
        WHERE
            channel_id = @ch1
            AND user_identifier = 'visitor-002'
    );

SET
    @t1 := (
        SELECT id
        FROM chat_thread
        WHERE
            channel_id = @ch1
            AND user_identifier = 'visitor-001'
    );

SET
    @t2 := (
        SELECT id
        FROM chat_thread
        WHERE
            channel_id = @ch1
            AND user_identifier = 'visitor-002'
    );

-- 3) 메시지 샘플(텍스트)
INSERT INTO
    chat_message (
        thread_id,
        sender_type,
        sender_name,
        message_type,
        content,
        is_read,
        created_by,
        created_ip,
        updated_by,
        updated_ip
    )
VALUES (
        @t1,
        'ADMIN',
        '관리자',
        'TEXT',
        '안녕하세요, 무엇을 도와드릴까요?',
        0,
        'admin',
        '127.0.0.1',
        'admin',
        '127.0.0.1'
    ),
    (
        @t1,
        'USER',
        '방문자A',
        'TEXT',
        '요금 안내 부탁드립니다.',
        0,
        'visitor-001',
        '127.0.0.1',
        'visitor-001',
        '127.0.0.1'
    ),
    (
        @t2,
        'ADMIN',
        '관리자',
        'TEXT',
        '안녕하세요, 방문자B님!',
        0,
        'admin',
        '127.0.0.1',
        'admin',
        '127.0.0.1'
    );

-- 4) 파일/이미지 메시지 샘플
-- (1) 파일 메시지: guide.pdf
INSERT INTO
    chat_message (
        thread_id,
        sender_type,
        sender_name,
        message_type,
        content,
        file_name,
        is_read,
        created_by,
        created_ip,
        updated_by,
        updated_ip
    )
VALUES (
        @t1,
        'ADMIN',
        '관리자',
        'FILE',
        '상품 안내서',
        'guide.pdf',
        0,
        'admin',
        '127.0.0.1',
        'admin',
        '127.0.0.1'
    );

SET @m_file1 := LAST_INSERT_ID();

INSERT INTO
    file (
        menu,
        menu_id,
        origin_name,
        saved_name,
        mime_type,
        size,
        ext,
        version,
        public_yn,
        file_order,
        message_id,
        created_by,
        created_ip
    )
VALUES (
        'CHAT',
        @t1,
        'guide.pdf',
        CONCAT(
            DATE_FORMAT(NOW(), '%Y%m%d'),
            '/sample_guide.pdf'
        ),
        'application/pdf',
        102400,
        'pdf',
        1,
        'Y',
        0,
        @m_file1,
        'system',
        '127.0.0.1'
    );

-- (2) 이미지 메시지: sample.png
INSERT INTO
    chat_message (
        thread_id,
        sender_type,
        sender_name,
        message_type,
        content,
        file_name,
        is_read,
        created_by,
        created_ip,
        updated_by,
        updated_ip
    )
VALUES (
        @t1,
        'ADMIN',
        '관리자',
        'IMAGE',
        '이미지 안내',
        'sample.png',
        0,
        'admin',
        '127.0.0.1',
        'admin',
        '127.0.0.1'
    );

SET @m_img1 := LAST_INSERT_ID();

INSERT INTO
    file (
        menu,
        menu_id,
        origin_name,
        saved_name,
        mime_type,
        size,
        ext,
        version,
        public_yn,
        file_order,
        message_id,
        created_by,
        created_ip
    )
VALUES (
        'CHAT',
        @t1,
        'sample.png',
        CONCAT(
            DATE_FORMAT(NOW(), '%Y%m%d'),
            '/sample_image.png'
        ),
        'image/png',
        40960,
        'png',
        1,
        'Y',
        0,
        @m_img1,
        'system',
        '127.0.0.1'
    );

-- 끝

USE cs_manager;

ALTER TABLE `file`
ADD COLUMN `message_id` BIGINT NULL AFTER `file_order`;

CREATE INDEX idx_file_message_id ON `file` (`message_id`);

SOURCE C:/workspace/chat/chat-server/DATABASE/chat_sample_seed.sql;




SELECT id, user_identifier, user_name FROM chat_thread WHERE id = 2;