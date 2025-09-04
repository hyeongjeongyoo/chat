DROP DATABASE IF EXISTS cms_new;
CREATE DATABASE cms_new
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    DEFAULT ENCRYPTION='N';
USE cms_new;
-- Users 테이블
CREATE TABLE IF NOT EXISTS users (
    uuid VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    avatar_url VARCHAR(255),
    status VARCHAR(20) NOT NULL,
    created_by VARCHAR(36),
    created_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(36),
    updated_ip VARCHAR(45),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(uuid),
    FOREIGN KEY (updated_by) REFERENCES users(uuid),
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menus 테이블
CREATE TABLE IF NOT EXISTS menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('LINK', 'FOLDER', 'BOARD', 'CONTENT') NOT NULL,
    url VARCHAR(255),
    target_id INT,
    display_position VARCHAR(50) NOT NULL,
    visible BOOLEAN DEFAULT true,
    sort_order INT NOT NULL,
    parent_id INT,
    created_by VARCHAR(36),
    created_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(36),
    updated_ip VARCHAR(45),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES menus(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(uuid),
    FOREIGN KEY (updated_by) REFERENCES users(uuid),
    UNIQUE KEY uk_menu_name (name),
    UNIQUE KEY uk_menu_url (url),
    INDEX idx_parent_id (parent_id),
    INDEX idx_display_position (display_position),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 초기 메뉴 데이터 (대메뉴)
INSERT INTO menus (id, name, type, url, display_position, visible, sort_order) VALUES
(1, '창업가꿈 소개', 'FOLDER', NULL, 'HEADER', true, 1),
(2, '창업기업 모집', 'FOLDER', NULL, 'HEADER', true, 2),
(3, '창업기업 소개', 'FOLDER', NULL, 'HEADER', true, 3),
(4, '커뮤니티', 'FOLDER', NULL, 'HEADER', true, 4);

-- 창업가꿈 소개 하위 메뉴
INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id) VALUES
('비전 및 목표', 'LINK', '/about/vision', 'HEADER', true, 1, 1),
('주요프로그램', 'LINK', '/about/program', 'HEADER', true, 2, 1),
('찾아오시는 길', 'LINK', '/about/location', 'HEADER', true, 3, 1);

-- 창업기업 모집 하위 메뉴
INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id) VALUES
('모집공고', 'LINK', '/recruit/notice', 'HEADER', true, 1, 2),
('지원안내', 'LINK', '/recruit/guide', 'HEADER', true, 2, 2),
('교육내용', 'LINK', '/recruit/education', 'HEADER', true, 3, 2),
('FAQ', 'LINK', '/recruit/faq', 'HEADER', true, 4, 2);

-- 창업기업 소개 하위 메뉴
INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id) VALUES
('참여기업', 'LINK', '/companies/participants', 'HEADER', true, 1, 3),
('기업별 소개', 'FOLDER', NULL, 'HEADER', true, 2, 3),
('참고자료실', 'LINK', '/companies/resources', 'HEADER', true, 3, 3);

-- 기업별 소개 하위 탭메뉴
SET @parent_id := (SELECT id FROM menus WHERE name = '기업별 소개' AND parent_id = 3);

INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id) VALUES
('오늘의 이야기', 'LINK', '/companies/details/today-story', 'HEADER', true, 1, @parent_id),
('유니마스', 'LINK', '/companies/details/unimas', 'HEADER', true, 2, @parent_id), 
('삼선택', 'LINK', '/companies/details/samseontaek', 'HEADER', true, 3, @parent_id),
('세로라', 'LINK', '/companies/details/serora', 'HEADER', true, 4, @parent_id);

-- 커뮤니티 하위 메뉴
INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id) VALUES
('답변게시판', 'BOARD', '/community/qna', 'HEADER', true, 1, 4);

-- 푸터 메뉴
INSERT INTO menus (name, type, url, display_position, visible, sort_order) VALUES
('이용약관', 'LINK', '/terms', 'FOOTER', true, 1),
('개인정보처리방침', 'LINK', '/privacy', 'FOOTER', true, 2),
('사이트맵', 'LINK', '/sitemap', 'FOOTER', true, 3);

-- Equipment 테이블
CREATE TABLE IF NOT EXISTS equipment (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    temperature DECIMAL(5,2),
    last_check TIMESTAMP,
    created_by VARCHAR(36),
    created_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(36),
    updated_ip VARCHAR(45),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(uuid),
    FOREIGN KEY (updated_by) REFERENCES users(uuid),
    INDEX idx_status (status),
    INDEX idx_last_check (last_check)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Monitoring 테이블
CREATE TABLE IF NOT EXISTS monitoring (
    id VARCHAR(36) PRIMARY KEY,
    equipment_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) NOT NULL,
    last_update TIMESTAMP,
    created_by VARCHAR(36),
    created_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(36),
    updated_ip VARCHAR(45),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(uuid),
    FOREIGN KEY (updated_by) REFERENCES users(uuid),
    INDEX idx_equipment_id (equipment_id),
    INDEX idx_status (status),
    INDEX idx_last_update (last_update)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

