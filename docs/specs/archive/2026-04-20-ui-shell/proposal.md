## Why

서비스의 핵심 여정(로그인 → 문서 업로드 → 챗)을 실제 화면으로 구현하여, 이해관계자와 팀이 서비스 전체 흐름을 직접 체감할 수 있는 공통 기준을 마련한다. 디자인 시스템(중립 팔레트·해요체·테두리 중심)이 제품에 처음 적용되며, 이후 API 연동의 기준이 될 UI 골격을 확정한다.

## What Changes

- `globals.css`에 fg-*, bg-* 시맨틱 CSS 변수 추가 (oklch 중립 팔레트 기반)
- `(app)` 라우트 그룹에 Sidebar + WordMark 기반 공통 레이아웃 도입
- `/login` 공개 페이지 — 중앙 카드, 이메일/비밀번호 폼, Keycloak SSO 버튼
- `/docs` 인증 페이지 — 드롭존 + 목업 문서 4개 목록(배지 상태 포함)
- `/chat` 인증 페이지 — 시드 대화(사용자·AI 버블) + Composer + 출처 인용 칩
- 루트(`/`)를 `/docs`로 리다이렉트하고 목업 인증 가드 설정
- features/auth, features/docs, features/chat 슬라이스 스캐폴딩

## Capabilities

### New Capabilities

- `shared-layout`: 인증 영역 공통 골격 — Sidebar(WordMark, "새 챗 시작" CTA, 내비게이션, 최근 대화, 유저 푸터)
- `login-page`: 공개 영역 로그인 카드 — 이메일/비밀번호 폼 + Keycloak SSO 버튼
- `doc-upload-page`: 내 문서 화면 — 드롭존 + 문서 목록(상태 배지)
- `chat-page`: 챗 화면 — 메시지 목록(버블) + Composer + 출처 인용 칩

### Modified Capabilities

(없음)

## Impact

- `src/app/globals.css` — 시맨틱 토큰 변수 추가
- `src/app/(app)/layout.tsx` — Sidebar 통합, 목업 인증 가드
- `src/app/(public)/login/page.tsx` — 신규
- `src/app/(app)/docs/page.tsx` — 신규
- `src/app/(app)/chat/page.tsx` — 신규
- `src/app/page.tsx` — /docs 리다이렉트
- `src/components/layout/Sidebar.tsx` — 신규
- `src/components/layout/WordMark.tsx` — 신규
- `src/features/auth/components/LoginCard.tsx` — 신규
- `src/features/docs/components/Dropzone.tsx` — 신규
- `src/features/docs/components/DocList.tsx` — 신규
- `src/features/docs/types.ts` — 신규
- `src/features/chat/components/MessageList.tsx` — 신규
- `src/features/chat/components/Composer.tsx` — 신규
- `src/features/chat/types.ts` — 신규

## Meta

- feature: ui-shell
- type: frontend
- package: frontend

프리로드: folder-conventions.md · dev-flow.md · forbidden-patterns.md
