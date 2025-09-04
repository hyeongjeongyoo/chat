# 프론트엔드 개발 문서 (재사용성 중심)

## 1. 개요 및 핵심 아키텍처

본 문서는 '통합 CMS 채팅 시스템'의 프론트엔드 설계를 정의합니다. 핵심 아키텍처 전략은 **아토믹 디자인(Atomic Design) 시스템을 도입**하여 컴포넌트의 재사용성을 극대화하고, **데이터 로직과 UI를 명확하게 분리**하는 것입니다.

게시판과 채팅 기능은 이 시스템 위에서 각각의 페이지를 구성하며, 공통 UI 요소와 로직을 최대한 공유합니다.

## 2. 컴포넌트 구조 (실제 프로젝트 기반)

```
/src/
├── app/                      // **[라우팅]** Next.js App Router (페이지)
│   ├── (admin)/              // 관리자 레이아웃
│   │   ├── dashboard/        // **(신규)** 대시보드 페이지
│   │   ├── chat/             // **(신규)** 채팅 페이지
│   │   └── board/            // (기존) 게시판 페이지
│   └── (user)/
│       └── chat/             // **(신규)** 사용자용 팝업 채팅 페이지
│
├── components/               // **[UI]** 재사용 가능한 UI 컴포넌트
│   ├── common/               // **[재사용]** 전역적으로 사용되는 컴포넌트 (Button, Input, Modal)
│   ├── board/                // (기존) 게시판에서만 사용하는 컴포넌트 (BoardList)
│   ├── chat/                 // **(신규)** 채팅에서만 사용하는 컴포넌트 (ChatList, MessageBubble)
│   └── dashboard/            // **(신규)** 대시보드 전용 컴포넌트 (KpiCard, Chart)
│
├── hooks/                    // **[로직]** 재사용 가능한 로직 (useApi, useSocket)
├── lib/                      // **[설정]** API 클라이언트(axios), 라이브러리 설정
├── stores/                   // **[상태]** 전역 상태 관리 (Recoil/Zustand)
└── types/                    // **[타입]** TypeScript 타입 정의
```

## 3. 재사용 전략: 어떤 기능을 재사용할 것인가?

### 3.1. 공통 컴포넌트 (`/components/common`) - **UI 재사용**

- **기존 활용**: `board` 기능은 이미 `/components/common`에 있는 `Button`, `Input`, `Pagination` 등의 컴포넌트를 사용하고 있을 것입니다.
- **신규 적용**: `chat` 기능을 구현할 때, 새로운 버튼이나 입력창을 만들지 않고 반드시 `/components/common`의 기존 컴포넌트를 최대한 활용하여 UI의 일관성을 유지합니다. 예를 들어, 메시지 전송 버튼은 `common`의 `Button`을, 파일 첨부 UI는 `common`의 `FileUpload`(만약 없다면 여기에 생성)를 사용합니다.

### 3.2. 공통 Hooks (`/hooks`) - **로직 재사용**

- **기존 활용**: API 호출 로직을 추상화한 `useApi` 훅은 `board` 관련 API 호출에 이미 사용되고 있을 것입니다.
- **신규 적용**: `chat` 관련 API(`GET /api/chat/threads` 등)를 호출할 때도 `useApi` 훅을 재사용하여 API 요청, 로딩, 에러 처리 로직을 통일합니다. WebSocket 통신을 위한 `useSocket` 훅을 새로 만들어 채팅 관련 컴포넌트들에서 사용합니다.

## 4. 신규 구현 기능

### 4.1. 대시보드

- **`app/(admin)/dashboard/page.tsx`**: 대시보드 페이지의 진입점입니다.
- **`components/dashboard/KpiCard.tsx`**: 총 활성 대화 수 등 KPI 정보를 표시하는 카드 컴포넌트입니다.
- **`components/dashboard/Chart.tsx`**: 시간대별 문의량 등 차트를 렌더링하는 재사용 가능한 차트 컴포넌트입니다. (e.g., `recharts` 라이브러리 활용)
- **데이터 Fetching**: `useApi` 훅 또는 `React-Query`의 `useQuery`를 사용하여 `/api/dashboard/*` 엔드포인트에서 데이터를 가져옵니다.

### 4.2. 채팅

채팅 기능은 아래의 고유한 컴포넌트와 로직을 중심으로 구현하되, **반드시 위에서 정의한 Atoms, Molecules, Hooks를 최대한 조합하여 만듭니다.**

- **`templates/AdminLayout.tsx`**: 좌(CMS 목록), 중(대화 목록), 우(메시지 타임라인) 3단 레이아웃을 정의합니다.
- **`organisms/ChatList.tsx`, `organisms/ChatMessageList.tsx`**: 채팅방 목록과 메시지 목록을 렌더링합니다.
- **`hooks/useSocket.ts`**: WebSocket 연결 및 STOMP 메시지 구독/발행 로직을 처리하는 커스텀 훅입니다.
