# CLAUDE.md

## 프로젝트 타입

fullstack (Next.js App Router + BFF)

## 기술 스택

- 언어·프레임워크: TypeScript / Next.js 16 App Router
- 패키지 매니저: pnpm
- 단위 테스트: Vitest + React Testing Library
- E2E: Playwright
- UI 라이브러리: Tailwind CSS + shadcn/ui (Google Stitch 디자인 토큰 참조)
- DB: 없음 — 외부 백엔드 API 연동 (BFF 경유)

## 아키텍처

- BFF: Next.js Route Handlers (`app/api/[...proxy]/`)
  - 브라우저 → BFF(Route Handler) → 외부 백엔드 API
  - 백엔드 URL은 서버 환경변수만 사용 — `NEXT_PUBLIC_*` 노출 금지
- 상태 관리: TanStack Query (서버 상태) + Zustand (클라이언트 상태)
- 테스트 폴더: `tests/unit/` (`src/` 트리 미러링, 유닛), `e2e/` (E2E)

## 폴더 구조

```
src/
├── app/                     # 라우팅 파일만 (page/layout/route/proxy)
│   ├── (app)/               # 인증 필요 라우트 그룹
│   ├── (public)/            # 공개 라우트 그룹
│   └── api/[...proxy]/      # BFF Route Handler
├── components/
│   ├── ui/                  # shadcn/ui — kebab-case
│   └── layout/              # 헤더/사이드바 — PascalCase
├── features/<domain>/       # 기능별 슬라이스 (자족적)
│   ├── api.ts
│   ├── queries.ts
│   ├── components/
│   ├── store.ts
│   └── types.ts
└── lib/
    ├── api.ts               # 클라이언트 fetcher (BFF 호출)
    ├── api-server.ts        # 서버 fetcher (백엔드 직접 호출)
    ├── navigation/
    └── query-keys/
```

## 개발 서버

```bash
pnpm dev
```

## 단위 테스트 명령

- 전체: `pnpm test`
- 감시 모드: `pnpm test --watch`
- 커버리지: `pnpm test:coverage`

## E2E 명령

- 로컬: `pnpm e2e --headed`
- CI: `pnpm e2e` (CI=1 자동 적용)

## 보안 스캔

```bash
pnpm audit
```

## 디자인 시스템

- Google Stitch에서 색상·타이포·간격 토큰 추출 → `tailwind.config.ts`에 반영
- shadcn/ui 컴포넌트를 Stitch 토큰 기반으로 스타일링
- 컴포넌트 소스는 `src/components/ui/`에 복사 보관 (완전 소유)

## 참조 문서

| 주제 | 문서 |
| --- | --- |
| 금지 패턴 | [docs/rules/forbidden-patterns.md](docs/rules/forbidden-patterns.md) |
| 폴더 규약 | [docs/rules/folder-conventions.md](docs/rules/folder-conventions.md) |
| 명령어 | [docs/rules/commands.md](docs/rules/commands.md) |
| 스택 특화 규율 | [docs/rules/stack-specific.md](docs/rules/stack-specific.md) |
| 에이전트 워크플로우 | [docs/rules/dev-workflow.md](docs/rules/dev-workflow.md) |
| SDD 트랙 | [docs/rules/dev-flow.md](docs/rules/dev-flow.md) |
