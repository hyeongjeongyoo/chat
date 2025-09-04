# 데이터베이스 설계 문서 (재사용성 중심)

## 1. 개요 및 핵심 전략

본 문서는 '통합 CMS 채팅 시스템'의 데이터베이스 스키마를 정의합니다. 핵심 전략은 **반복되는 컬럼들을 `BaseEntity` 개념으로 추상화**하여, 모든 주요 테이블이 이를 상속받는 구조로 설계함으로써 **일관성과 재사용성을 확보**하는 것입니다.

`Board` (기존 기능), `ChatMessage` (신규 기능) 등 모든 도메인 엔티티는 이 `BaseEntity`를 확장하여 감사(Auditing) 기능을 코드 중복 없이 구현합니다.

## 2. 공통 최상위 엔티티 (`BaseEntity`)

모든 엔티티는 아래의 감사(Audit) 필드를 공통으로 상속받습니다. JPA의 `@MappedSuperclass`와 Auditing 기능을 활용하여 이 필드들은 자동으로 관리됩니다.

| 공통 컬럼    | 데이터 타입 | 설명                          |
| ------------ | ----------- | ----------------------------- |
| `created_by` | VARCHAR(50) | 생성자 ID (userId or adminId) |
| `created_ip` | VARCHAR(45) | 생성자 IP                     |
| `created_at` | TIMESTAMP   | 생성 시각                     |
| `updated_by` | VARCHAR(50) | 수정자 ID (adminId)           |
| `updated_ip` | VARCHAR(45) | 수정자 IP                     |
| `updated_at` | TIMESTAMP   | 수정 시각                     |

## 3. ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    ChatChannel {
        bigint id PK
        varchar(50) cms_code "Unique"
        varchar(100) cms_name
        -- BaseEntity --
        varchar(50) created_by
        timestamp created_at
        varchar(50) updated_by
        timestamp updated_at
    }

    ChatThread {
        bigint id PK
        bigint channel_id FK
        varchar(255) user_identifier "Unique per channel"
        varchar(100) user_name
        -- BaseEntity --
        varchar(50) created_by
        timestamp created_at
        varchar(50) updated_by
        timestamp updated_at
    }

    ChatMessage {
        bigint id PK
        bigint thread_id FK
        varchar(20) sender_type
        varchar(20) message_type
        text content
        boolean is_read
        -- BaseEntity --
        varchar(50) created_by
        timestamp created_at
        varchar(50) updated_by
        timestamp updated_at
    }

    ChatChannel ||--o{ ChatThread : "has"
    ChatThread ||--o{ ChatMessage : "has"
```

## 4. 테이블 명세

### 4.1. `chat_channel`

- **상속**: `BaseEntity`
- **설명**: CMS 채널 정보를 저장합니다.

| 고유 컬럼  | 데이터 타입  | 제약조건           | 설명                     |
| ---------- | ------------ | ------------------ | ------------------------ |
| `id`       | BIGINT       | PK, Auto-increment | 채널 고유 ID             |
| `cms_code` | VARCHAR(50)  | Not Null, Unique   | CMS를 식별하는 고유 코드 |
| `cms_name` | VARCHAR(100) |                    | CMS의 이름               |

### 4.2. `chat_thread`

- **상속**: `BaseEntity`
- **설명**: 사용자별 1:1 채팅방 정보를 관리합니다.

| 고유 컬럼         | 데이터 타입                            | 제약조건           | 설명                     |
| ----------------- | -------------------------------------- | ------------------ | ------------------------ |
| `id`              | BIGINT                                 | PK, Auto-increment | 채팅방 고유 ID           |
| `channel_id`      | BIGINT                                 | Not Null, FK       | `chat_channel`의 ID 참조 |
| `user_identifier` | VARCHAR(255)                           | Not Null           | 사용자 식별 고유 값      |
| `user_name`       | VARCHAR(100)                           |                    | 사용자 이름              |
| `user_ip`         | VARCHAR(50)                            |                    | 사용자 접속 IP 주소      |
| **제약조건**      | `UNIQUE (channel_id, user_identifier)` |                    |                          |

### 4.3. `chat_message`

- **상속**: `BaseEntity`
- **설명**: 채팅방 내의 모든 메시지를 저장합니다.

| 고유 컬럼      | 데이터 타입  | 제약조건                  | 설명                             |
| -------------- | ------------ | ------------------------- | -------------------------------- |
| `id`           | BIGINT       | PK, Auto-increment        | 메시지 고유 ID                   |
| `thread_id`    | BIGINT       | Not Null, FK              | `chat_thread`의 ID를 참조        |
| `sender_type`  | VARCHAR(20)  | Not Null                  | 발신자 타입 (`USER`, `ADMIN`)    |
| `message_type` | VARCHAR(20)  | Not Null                  | 메시지 타입 (`TEXT`, `IMAGE` 등) |
| `content`      | TEXT         |                           | 메시지 내용                      |
| `file_name`    | VARCHAR(255) |                           | 원본 파일명                      |
| `file_url`     | VARCHAR(512) |                           | 파일 접근/다운로드 경로          |
| `is_read`      | BOOLEAN      | Not Null, Default `false` | 관리자의 메시지 읽음 여부        |
| `read_at`      | DATETIME     |                           | 관리자가 메시지를 읽은 시간      |
