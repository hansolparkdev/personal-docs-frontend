# Personal Docs — Frontend

개인 문서를 업로드하고 AI와 대화하는 RAG 기반 문서 챗 서비스의 프론트엔드입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 App Router |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4 + shadcn/ui |
| 서버 상태 | TanStack Query |
| 클라이언트 상태 | Zustand |
| 아이콘 | lucide-react |
| 단위 테스트 | Vitest + React Testing Library |
| E2E | Playwright |
| 패키지 매니저 | pnpm |

## 아키텍처

브라우저는 백엔드에 직접 접근하지 않습니다. 모든 API 호출은 BFF(Backend For Frontend) Route Handler를 경유합니다.

```
브라우저 → /api/[...proxy]/ (Next.js Route Handler) → 외부 백엔드 API
```

백엔드 URL은 서버 환경변수(`BACKEND_URL`)로만 관리하며 브라우저에 노출하지 않습니다.

## 화면 구성

| 경로 | 설명 |
|------|------|
| `/login` | 로그인 (이메일/비밀번호, Keycloak SSO) |
| `/docs` | 문서 업로드 및 목록 관리 |
| `/chat` | AI 문서 챗 |

## 폴더 구조

```
src/
├── app/                     # 라우팅 파일만 (page/layout/route)
│   ├── (app)/               # 인증 필요 라우트 그룹
│   ├── (public)/            # 공개 라우트 그룹
│   └── api/[...proxy]/      # BFF Route Handler
├── components/
│   ├── ui/                  # shadcn/ui 컴포넌트
│   └── layout/              # Sidebar, WordMark 등 공통 레이아웃
├── features/<domain>/       # 기능별 슬라이스 (auth, docs, chat)
│   ├── components/
│   ├── types.ts
│   └── mock-data.ts
└── lib/
    ├── api.ts               # 클라이언트 fetcher
    └── api-server.ts        # 서버 fetcher

tests/unit/                  # 단위 테스트 (src/ 트리 미러링)
e2e/                         # E2E 테스트
```

## 시작하기

### 환경변수 설정

```bash
cp .env.example .env.local
```

| 변수 | 설명 |
|------|------|
| `BACKEND_URL` | 백엔드 API 서버 주소 (서버 전용) |

### 개발 서버 실행

```bash
pnpm install
pnpm dev
```

## 명령어

```bash
pnpm dev              # 개발 서버 (http://localhost:3000)
pnpm build            # 프로덕션 빌드
pnpm start            # 프로덕션 서버
pnpm lint             # ESLint
pnpm typecheck        # TypeScript 타입 검사
pnpm test             # 단위 테스트 전체 실행
pnpm test:watch       # 단위 테스트 감시 모드
pnpm test:coverage    # 커버리지 측정
pnpm e2e --headed     # E2E 테스트 (로컬)
pnpm e2e              # E2E 테스트 (CI)
pnpm format           # Prettier 포맷
pnpm audit            # 보안 취약점 스캔
```

## 디자인 시스템

oklch 기반 중립 팔레트와 단일 destructive red로 구성된 near-monochrome 디자인입니다.

- 폰트: Geist Sans / Geist Mono
- 색상: `src/app/globals.css`의 CSS 변수 (`--fg-*`, `--bg-*`)
- 컴포넌트: shadcn/ui (`src/components/ui/`)
- 아이콘: lucide-react

## 관련 레포지토리

- 백엔드: [personal-docs-backend](https://github.com/hansolparkdev/personal-docs-backend) — FastAPI + pgvector + MinIO + Keycloak + LangChain/LangGraph
