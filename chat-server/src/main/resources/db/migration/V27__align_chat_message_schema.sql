-- Align chat_message/chat_thread/chat_channel schema with JPA entities

-- 1) chat_message: add missing columns if not exists
ALTER TABLE chat_message
ADD COLUMN IF NOT EXISTS sender_name VARCHAR(100) NOT NULL AFTER sender_type,
ADD COLUMN IF NOT EXISTS created_ip VARCHAR(50) NULL AFTER created_by,
ADD COLUMN IF NOT EXISTS updated_ip VARCHAR(50) NULL AFTER updated_at;

-- Backfill sender_name for existing rows (ADMIN -> created_by, else 'user' fallback)
UPDATE chat_message
SET
    sender_name = COALESCE(
        NULLIF(created_by, ''),
        'admin'
    )
WHERE
    sender_name IS NULL
    OR sender_name = '';

-- Backfill IP columns for existing rows
UPDATE chat_message
SET
    created_ip = COALESCE(
        NULLIF(created_ip, ''),
        '127.0.0.1'
    )
WHERE
    created_ip IS NULL
    OR created_ip = '';

UPDATE chat_message
SET
    updated_ip = COALESCE(
        NULLIF(updated_ip, ''),
        created_ip,
        '127.0.0.1'
    )
WHERE
    updated_ip IS NULL
    OR updated_ip = '';

-- 2) Safety: chat_thread may miss IP columns on some DBs
ALTER TABLE chat_thread
ADD COLUMN IF NOT EXISTS created_ip VARCHAR(50) NULL AFTER created_by,
ADD COLUMN IF NOT EXISTS updated_ip VARCHAR(50) NULL AFTER updated_at;

UPDATE chat_thread
SET
    created_ip = COALESCE(
        NULLIF(created_ip, ''),
        '127.0.0.1'
    )
WHERE
    created_ip IS NULL
    OR created_ip = '';

UPDATE chat_thread
SET
    updated_ip = COALESCE(
        NULLIF(updated_ip, ''),
        created_ip,
        '127.0.0.1'
    )
WHERE
    updated_ip IS NULL
    OR updated_ip = '';

-- 3) Safety: chat_channel may miss IP columns on some DBs
ALTER TABLE chat_channel
ADD COLUMN IF NOT EXISTS created_ip VARCHAR(50) NULL AFTER created_by,
ADD COLUMN IF NOT EXISTS updated_ip VARCHAR(50) NULL AFTER updated_at;

UPDATE chat_channel
SET
    created_ip = COALESCE(
        NULLIF(created_ip, ''),
        '127.0.0.1'
    )
WHERE
    created_ip IS NULL
    OR created_ip = '';

UPDATE chat_channel
SET
    updated_ip = COALESCE(
        NULLIF(updated_ip, ''),
        created_ip,
        '127.0.0.1'
    )
WHERE
    updated_ip IS NULL
    OR updated_ip = '';