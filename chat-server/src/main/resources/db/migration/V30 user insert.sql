USE cs_manager;

-- 원하는 값으로만 바꿔서 실행
SET @channel_id := 002;

SET @thread_id := 002;

SET @message_id := 002;
-- 옵션: 초기 메시지까지 직접 ID로 만들 경우
SET @cms_code := 'A002';

SET @cms_name := '울산과학대학교 심리상담센터';

SET @user_identifier := 'uc-user-001';

SET @user_name := '울산과학대학교 심리상담센터';

SET @actor := 'admin';

SET @ip := '127.0.0.1';

START TRANSACTION;

-- 1) 채널: 원하는 ID로 강제 생성 (id, cms_code 모두 기존에 없어야 함)
INSERT INTO
    chat_channel (
        id,
        cms_code,
        cms_name,
        created_by,
        created_ip
    )
VALUES (
        @channel_id,
        @cms_code,
        @cms_name,
        @actor,
        @ip
    );

-- 채널 AUTO_INCREMENT 올려 재충돌 방지
SET @next_ai := @channel_id + 1;

SET
    @sql := CONCAT(
        'ALTER TABLE chat_channel AUTO_INCREMENT = ',
        @next_ai
    );

PREPARE st1 FROM @sql;

EXECUTE st1;

DEALLOCATE PREPARE st1;

-- 2) 스레드: 원하는 ID + 위 채널 참조로 강제 생성
INSERT INTO
    chat_thread (
        id,
        channel_id,
        user_identifier,
        user_name,
        created_by,
        created_ip
    )
VALUES (
        @thread_id,
        @channel_id,
        @user_identifier,
        @user_name,
        @actor,
        @ip
    );

-- 스레드 AUTO_INCREMENT 올림
SET @next_ai := @thread_id + 1;

SET
    @sql := CONCAT(
        'ALTER TABLE chat_thread AUTO_INCREMENT = ',
        @next_ai
    );

PREPARE st2 FROM @sql;

EXECUTE st2;

DEALLOCATE PREPARE st2;

-- 3) (옵션) 초기 메시지도 원하는 ID로 생성
INSERT INTO
    chat_message (
        id,
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
        @message_id,
        @thread_id,
        'ADMIN',
        'admin',
        'TEXT',
        '안녕하세요, 무엇을 도와드릴까요?',
        0,
        @actor,
        @ip
    );

-- 메시지 AUTO_INCREMENT 올림 (옵션)
SET @next_ai := @message_id + 1;

SET
    @sql := CONCAT(
        'ALTER TABLE chat_message AUTO_INCREMENT = ',
        @next_ai
    );

PREPARE st3 FROM @sql;

EXECUTE st3;

DEALLOCATE PREPARE st3;

COMMIT;

-- 결과 확인
SELECT
    @channel_id AS channel_id,
    @thread_id AS thread_id,
    @message_id AS message_id;





    -- 1) 해당 메시지 행
SELECT * FROM chat_message WHERE id = 2;

-- 2) 어떤 스레드/채널(업체) 소속인지
SELECT m.id, m.thread_id, m.sender_type, m.message_type, m.content, m.created_at, m.updated_at, t.channel_id, t.user_identifier, t.user_name, c.cms_code, c.cms_name
FROM
    chat_message m
    JOIN chat_thread t ON t.id = m.thread_id
    JOIN chat_channel c ON c.id = t.channel_id
WHERE
    m.id = 2;

-- 3) 첨부파일에 매핑돼 있는지(파일 테이블 참조)
SELECT * FROM file WHERE message_id = 2;