# 백엔드 개발 문서 (재사용성 중심)

## 1. 개요 및 핵심 아키텍처

본 문서는 '통합 CMS 채팅 시스템'의 백엔드 시스템 설계를 정의합니다. 핵심 아키텍처 전략은 **기능별로 패키지를 명확히 분리**하고, **여러 도메인에서 공통으로 사용되는 로직은 'Core' 모듈로 추출**하여 재사용성을 극대화하는 것입니다.

기존 `Board` 기능과 신규 `Chat` 기능은 이 구조 안에서 독립적으로 개발되고 확장될 수 있습니다.

## 2. 모듈 및 패키지 구조 (실제 프로젝트 기반)

```
egovframework.com              // 전자정부프레임워크 기본 구조
├── cms                        // **[도메인]** 실제 비즈니스 로직이 위치
│   ├── board                  // (기존) 게시판 기능
│   │   └── web                // BoardController.java
│   │   └── service              // BoardService.java, Board.java
│   │
│   └── chat                   // **(신규)** 채팅 기능 추가 위치
│       ├── web                // ChatController.java, ChatSocketController.java
│       └── service              // ChatService.java, ChatThread.java 등
│
│   └── dashboard              // **(신규)** 대시보드 기능 추가 위치
│       └── web                // DashboardController.java
│       └── service              // DashboardService.java
│
└── egovframework              // **[코어]** 공통/기반 모듈
    └── com
        ├── cmm                // 공통코드, 유틸리티 등
        │   └── service        // **[재사용] EgovFileMngService.java**
        │
        └── rte                // 전자정부프레임워크 실행 환경
            ├── psl.dataaccess // DAO, Mapper 지원
            └── fdl.cmmn       // 공통 기능 (Exception 등)

```

## 3. 재사용 전략: 어떤 기능을 재사용할 것인가?

### 3.1. 파일 업로드 (`EgovFileMngService`) - **최우선 재사용 대상**

- **기존 위치**: `egovframework.com.cmm.service.EgovFileMngService`
- **재사용 방안**:
  1. 기존 게시판(`Board`)에서 `EgovFileMngService`를 사용하여 파일 처리를 하고 있을 가능성이 매우 높습니다.
  2. 신규 `ChatService`에서도 동일하게 `EgovFileMngService`를 주입받아 사용합니다.
  3. 채팅에서 파일 전송 시, 이 서비스를 호출하여 파일을 저장하고, 반환되는 `FileVO` 리스트에서 파일 경로 등의 정보를 추출하여 `ChatMessage`에 저장합니다.

### 3.2. JPA Auditing (`core.config`, `BaseEntity`) - **전사적 재사용**

- **구현**: `@MappedSuperclass`로 `BaseEntity`를 정의하고, 모든 엔티티(`Board`, `ChatMessage` 등)가 이를 상속받게 합니다.
- **효과**: 어떤 엔티티가 추가되든 별도 코드 없이 생성/수정 이력이 자동으로 기록됩니다.

### 3.3. 전역 예외 처리 및 응답 (`core.exception`) - **API 일관성**

- `@RestControllerAdvice`를 사용한 `GlobalExceptionHandler`는 `BoardController`와 `ChatController`에서 발생하는 모든 예외를 동일한 포맷의 응답으로 처리하여 API의 일관성을 보장합니다.

## 4. 신규 구현 기능: 채팅 (`domain.chat`)

채팅 기능은 아래의 고유한 로직을 중심으로 구현합니다.

- **`ChatService`**:
  - `userIdentifier`를 기반으로 채팅방(`ChatThread`)을 조회하거나 생성하는 로직.
  - 메시지를 저장하고, 안 읽은 메시지 수를 계산하는 로직.
  - 메시지 저장 시, `messageType`이 `IMAGE` 등 파일 관련 타입이면 `core.file.FileService`를 호출하여 파일 처리.
- **`ChatSocketController`**:
  - `@MessageMapping`을 사용하여 `/pub/chat/message` 등의 STOMP 메시지를 처리.
  - `@SendTo` 또는 `SimpMessagingTemplate`을 사용하여 `/sub/chat/{threadId}` 토픽으로 실시간 메시지를 브로드캐스팅.

## 5. API 및 WebSocket 명세

_API 명세는 `README.md`의 내용을 기반으로 하며, 모든 API는 위의 모듈 구조 안에서 각자의 컨트롤러에 구현됩니다._

### 5.1. 신규 API: 대시보드

- **Controller**: `DashboardController`
- **`GET /api/dashboard/kpi`**: 대시보드 상단의 핵심 지표(KPI) 데이터를 조회합니다.
  - **Response**: `{ "activeThreads": 128, "todayInquiries": 32, "avgResponseTime": 92, "diskUsage": 20 }`
- **`GET /api/dashboard/inquiries-by-time`**: 시간대별 문의량 데이터를 조회합니다.
  - **Response**: `[ { "time": "09:00", "count": 5 }, ... ]`
- **`GET /api/dashboard/inquiries-by-cms`**: CMS별 활성 대화 비중 데이터를 조회합니다.
  - **Response**: `[ { "cmsName": "CMS A", "percentage": 45 }, ... ]`

### 5.2. 채팅 및 WebSocket

_채팅 관련 API와 WebSocket 명세는 기존 문서와 동일합니다._
