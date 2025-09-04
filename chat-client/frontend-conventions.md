# 프론트엔드 공통 컨벤션 (Next.js + Chakra UI + TypeScript)

## 1. 폴더 구조

```json
root/
├─ src/                          # 📦 소스 코드의 루트 디렉토리
│   ├─ app/                      # 📄 Next.js의 App Router 구조
│   │   ├─ layout.tsx            # 공통 레이아웃 (모든 페이지에 적용)
│   │   ├─ page.tsx              # 홈페이지 (/)
│   │   ├─ not-found.tsx         # 404 페이지
│   │   ├─ error.tsx             # 오류 처리 페이지
│   │   └─ (routes)/               # 라우팅 경로
│   │       ├─ companies/        # 기업 관련 페이지
│   │       │   ├─ intro/        # 기업 소개 페이지
│   │       │   │   └─ page.tsx
│   │       │   └─ list/         # 기업 목록 페이지
│   │       │       └─ page.tsx
│   │       └─ users/            # 사용자 관련 페이지
│   │           ├─ login/
│   │           │   └─ page.tsx
│   │           └─ profile/
│   │               └─ page.tsx
│   │
│   ├─ components/               # 🧩 재사용 가능한 UI 컴포넌트
│   │   ├─ ui/                   # 기본 UI 컴포넌트 (버튼, 입력 등)
│   │   │   ├─ Button.tsx
│   │   │   └─ color-mode.tsx    # 다크모드 관련 컴포넌트
│   │   ├─ layout/               # 레이아웃 관련 컴포넌트
│   │   │   ├─ view/
│   │   │   │   └─ Layout.tsx    # 페이지 레이아웃 컴포넌트
│   │   │   └─ Header.tsx
│   │   ├─ common/               # 공통 컴포넌트 (헤더, 푸터 등)
│   │   └─ sections/             # 특정 섹션/블록 컴포넌트
│   │       ├─ MovieSection.tsx  # 동영상 섹션 컴포넌트
│   │       └─ EnterpriseSection.tsx  # 기업 섹션 컴포넌트
│   │
│   ├─ lib/                      # 📚 유틸리티 및 비즈니스 로직
│   │   ├─ api/                  # API 관련 함수
│   │   │   ├─ client.ts         # Axios 또는 Fetch 설정
│   │   │   └─ menu.ts           # 메뉴 관련 API 호출
│   │   ├─ hooks/                # 커스텀 React 훅
│   │   │   └─ useMenu.ts        # 메뉴 관련 훅
│   │   └─ utils/                # 유틸리티 함수
│   │       └─ formatter.ts      # 데이터 포맷팅 함수
│   │
│   ├─ styles/                   # 🎨 스타일 관련 파일
│   │   ├─ theme.ts              # Chakra UI 테마 설정
│   │   ├─ theme-tokens.ts       # 테마 토큰 (색상, 폰트 등)
│   │   └─ scrollbar.ts          # 스크롤바 스타일
│   │
│   └─ types/                    # 📝 TypeScript 타입 정의
│       ├─ api.ts                # API 관련 타입
│       └─ common.ts             # 공통 타입
│
├─ public/                       # 📁 정적 파일 (이미지, 아이콘 등)
│   ├─ images/                   # 이미지 폴더
│   │   ├─ common/               # 공통 이미지
│   │   └─ contents/             # 콘텐츠 관련 이미지
│   └─ favicon.ico               # 파비콘
│
├─ .eslintrc.js                  # ESLint 설정
├─ .prettierrc                   # Prettier 설정
├─ next.config.js                # Next.js 설정
├─ tsconfig.json                 # TypeScript 설정
└─ package.json                  # 프로젝트 종속성
```

## 2. 컴포넌트 구조 레이어

| 레이어        | 폴더                    | 역할                             |
| ------------- | ----------------------- | -------------------------------- |
| 페이지        | src/app                 | 라우팅 및 페이지 컴포넌트        |
| 레이아웃      | src/components/layout   | 페이지 골격 구성 (헤더, 푸터 등) |
| 섹션          | src/components/sections | 페이지 내 주요 섹션              |
| UI 컴포넌트   | src/components/ui       | 재사용 가능한 기본 UI 요소       |
| 비즈니스 로직 | src/lib                 | API 호출, 데이터 처리            |
| 스타일링      | src/styles              | 테마 및 글로벌 스타일            |

## 3. 네이밍 컨벤션

| 항목               | 규칙                                     | 예시                     |
| ------------------ | ---------------------------------------- | ------------------------ |
| 파일/폴더          | 컴포넌트는 PascalCase, 그 외는 camelCase | Button.tsx, useMenu.ts   |
| 컴포넌트           | PascalCase                               | EnterpriseSection        |
| 함수               | camelCase                                | handleSubmit             |
| 훅                 | use 접두사 + camelCase                   | useMenu                  |
| 타입/인터페이스    | PascalCase                               | UserProfileProps         |
| CSS 클래스         | kebab-case (실제 HTML)                   | error-wrap               |
| Chakra 스타일 prop | camelCase                                | fontFamily, borderRadius |

## 4. Chakra UI 스타일링 가이드

| 방식            | 용도                      | 예시                                                      |
| --------------- | ------------------------- | --------------------------------------------------------- |
| Props 스타일링  | 컴포넌트 직접 스타일링    | `<Box bg="#F4F8FF" p="50px 0">`                           |
| 테마 활용       | 일관된 스타일 적용        | `colors.primary.default`                                  |
| 반응형 스타일   | 화면 크기별 스타일        | `fontSize={{ base: "1.25em", md: "1.3em", lg: "1.4em" }}` |
| 의미적 컴포넌트 | 의미에 맞는 컴포넌트 사용 | `<Heading>` 대신 `<h1>` 사용하지 않기                     |

## 5. 상태 관리

| 범위 | 방식                   | 용도                    |
| ---- | ---------------------- | ----------------------- |
| 로컬 | useState, useReducer   | 컴포넌트 내부 상태      |
| 공유 | useContext + 커스텀 훅 | 테마, 인증 등 공유 상태 |
| 서버 | 커스텀 훅 (useMenu 등) | API 데이터 요청 및 캐싱 |

## 6. TypeScript 컨벤션

| 항목               | 규칙                                             | 예시                                             |
| ------------------ | ------------------------------------------------ | ------------------------------------------------ |
| 인터페이스 vs 타입 | 확장 가능성있는 객체는 interface, 그 외에는 type | interface Styles, type ThemeStyles               |
| Props 타입         | interface + Props 접미사                         | interface ButtonProps                            |
| 컴포넌트           | FC 사용하지 않고 명시적 반환 타입                | function Button(props: ButtonProps): JSX.Element |
| 타입 단언          | 가능한 타입 단언 대신 타입 가드 사용             | styles as unknown as Styles (지양)               |
| 타입 임포트        | import type 구문 사용                            | import type { Styles } from "@/styles/theme"     |

## 7. 코드 구성 패턴

| 패턴            | 설명                               | 예시                  |
| --------------- | ---------------------------------- | --------------------- |
| 선언적 컴포넌트 | UI는 데이터 상태의 함수로 정의     | 상태에 따라 UI 렌더링 |
| Hooks 분리      | 비즈니스 로직을 훅으로 분리        | useMenu() 훅 사용     |
| 데이터 변환     | 데이터 변환 로직을 컴포넌트 밖으로 | useMemo로 데이터 가공 |
| 이벤트 핸들러   | handle 접두사 사용                 | handlePlayPause       |

## 8. Next.js 패턴

| 항목                | 규칙                      | 비고                         |
| ------------------- | ------------------------- | ---------------------------- |
| 페이지              | App Router 사용 (src/app) | 각 폴더는 URL 경로와 일치    |
| 레이아웃            | layout.tsx 사용           | 중첩 레이아웃 지원           |
| 클라이언트 컴포넌트 | "use client" 선언         | 인터랙티브 컴포넌트에 적용   |
| 이미지              | next/image 사용           | 자동 최적화 및 lazy loading  |
| 링크                | next/link 사용            | 클라이언트 사이드 네비게이션 |

## 9. 성능 최적화

| 기법          | 용도                  | 구현 방법                          |
| ------------- | --------------------- | ---------------------------------- |
| 메모이제이션  | 불필요한 재계산 방지  | useMemo, useCallback               |
| 코드 스플리팅 | 초기 로드 시간 감소   | 동적 import()                      |
| 이미지 최적화 | 페이지 로딩 속도 개선 | next/image                         |
| SSR/SSG       | SEO 및 초기 로딩 개선 | getServerSideProps, getStaticProps |

## 10. 에러 처리

| 방식       | 용도               | 구현                         |
| ---------- | ------------------ | ---------------------------- |
| 경계 오류  | 컴포넌트 오류 격리 | Error Boundary               |
| API 오류   | API 요청 실패 처리 | try-catch + 사용자 피드백    |
| 404 페이지 | 없는 페이지 처리   | not-found.tsx                |
| 로딩 상태  | 비동기 작업 표시   | loading.tsx 또는 스켈레톤 UI |

## 11. 접근성

| 항목          | 설명                    | 구현                     |
| ------------- | ----------------------- | ------------------------ |
| 시맨틱 HTML   | 의미적 태그 사용        | Box as="section"         |
| 키보드 접근성 | 키보드로 모든 기능 사용 | 포커스 관리, tabIndex    |
| 스크린 리더   | 스크린 리더 지원        | aria-\* 속성, alt 텍스트 |
| 색상 대비     | 충분한 색상 대비        | 테마 토큰 활용           |

## 12. 국제화

| 항목        | 설명           | 구현                           |
| ----------- | -------------- | ------------------------------ |
| 텍스트 관리 | 하드코딩 방지  | 텍스트를 constants 파일로 분리 |
| 다국어 지원 | 언어 전환 지원 | next-intl 또는 i18next         |
| 날짜/시간   | 지역별 포맷    | Intl API 활용                  |

## 13. 테스트

| 범주            | 도구                         | 대상                 |
| --------------- | ---------------------------- | -------------------- |
| 단위 테스트     | Jest + React Testing Library | 훅, 유틸리티 함수    |
| 컴포넌트 테스트 | React Testing Library        | UI 컴포넌트          |
| E2E 테스트      | Cypress                      | 주요 사용자 시나리오 |
| 시각적 테스트   | Storybook                    | UI 컴포넌트 문서화   |

## 14. 배포 및 환경 설정

| 항목        | 설명            | 구현                        |
| ----------- | --------------- | --------------------------- |
| 환경 변수   | 환경별 설정     | .env.local, .env.production |
| CI/CD       | 자동화된 배포   | GitHub Actions              |
| 빌드 최적화 | 성능 개선       | next.config.js 설정         |
| 모니터링    | 실시간 모니터링 | Sentry, Google Analytics    |
