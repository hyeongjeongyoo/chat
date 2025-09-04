-- 기존 테이블 삭제
DROP TABLE IF EXISTS menus;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS monitoring;

-- menus 테이블 생성
CREATE TABLE IF NOT EXISTS menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  url VARCHAR(255),
  display_position VARCHAR(50) NOT NULL,
  visible BOOLEAN DEFAULT true,
  sort_order INT NOT NULL,
  parent_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES menus(id) ON DELETE CASCADE
);

-- 메인 메뉴 생성
INSERT INTO menus (name, type, url, display_position, visible, sort_order)
VALUES 
  ('창업가꿈 소개', 'FOLDER', NULL, 'HEADER', 1, 1),
  ('창업기업 모집', 'FOLDER', NULL, 'HEADER', 1, 2),
  ('창업기업 소개', 'FOLDER', NULL, 'HEADER', 1, 3),
  ('커뮤니티', 'FOLDER', NULL, 'HEADER', 1, 4);

-- 창업가꿈 소개 하위 메뉴
INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT '비전 및 목표', 'CONTENT', '/about/vision', 'HEADER', 1, 1, id
FROM menus WHERE name = '창업가꿈 소개';

INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT '주요프로그램', 'CONTENT', '/about/program', 'HEADER', 1, 2, id
FROM menus WHERE name = '창업가꿈 소개';

INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT '찾아오시는 길', 'CONTENT', '/about/location', 'HEADER', 1, 3, id
FROM menus WHERE name = '창업가꿈 소개';

-- 창업기업 모집 하위 메뉴
INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT '모집공고', 'CONTENT', '/recruit/notice', 'HEADER', 1, 1, id
FROM menus WHERE name = '창업기업 모집';

INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT '지원안내', 'CONTENT', '/recruit/guide', 'HEADER', 1, 2, id
FROM menus WHERE name = '창업기업 모집';

INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT '교육내용', 'CONTENT', '/recruit/education', 'HEADER', 1, 3, id
FROM menus WHERE name = '창업기업 모집';

INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT 'FAQ', 'BOARD', '/recruit/faq', 'HEADER', 1, 4, id
FROM menus WHERE name = '창업기업 모집';

-- 창업기업 소개 하위 메뉴
INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT '참여기업', 'CONTENT', '/companies/participants', 'HEADER', 1, 1, id
FROM menus WHERE name = '창업기업 소개';

INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT '기업별 소개', 'FOLDER', NULL, 'HEADER', 1, 2, id
FROM menus WHERE name = '창업기업 소개';

INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT '참고자료실', 'BOARD', '/companies/resources', 'HEADER', 1, 3, id
FROM menus WHERE name = '창업기업 소개';

-- 기업별 소개 하위 메뉴
INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT '오늘의 이야기', 'LINK', '/companies/details/today-story', 'HEADER', 1, 1, id
FROM menus WHERE name = '기업별 소개';

INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT '유니마스', 'LINK', '/companies/details/unimas', 'HEADER', 1, 2, id
FROM menus WHERE name = '기업별 소개';

INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT '삼선택', 'LINK', '/companies/details/samseontaek', 'HEADER', 1, 3, id
FROM menus WHERE name = '기업별 소개';

INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT '세로라', 'LINK', '/companies/details/serora', 'HEADER', 1, 4, id
FROM menus WHERE name = '기업별 소개';

-- 커뮤니티 하위 메뉴
INSERT INTO menus (name, type, url, display_position, visible, sort_order, parent_id)
SELECT '답변게시판', 'BOARD', '/community/qna', 'HEADER', 1, 1, id
FROM menus WHERE name = '커뮤니티'; 