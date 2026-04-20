## Why

현재 프론트엔드 전체가 목업 데이터로 동작하여 실제 계정 생성·파일 보관·세션 유지가 불가능하다. FastAPI 백엔드의 인증·파일 API가 준비된 상태이므로, 목업을 실제 백엔드 연동으로 교체하여 제품이 동작 가능한 상태가 되어야 한다.

## What Changes

- `LoginCard`의 email 필드를 username으로 교체, BFF를 통한 실제 `POST /auth/login` 호출로 대체
- 회원가입 폼 추가 및 `POST /auth/register` 연동
- SSO 콜백 처리를 위한 `/auth/callback` 페이지 신규 추가
- 인증 토큰을 HttpOnly 쿠키로 저장 (BFF Set-Cookie), localStorage/sessionStorage 사용 금지
- `Sidebar`의 하드코딩 유저 정보를 `GET /auth/me` 실제 데이터로 교체
- `DocList`의 `useState` 목업을 TanStack Query(`useQuery`/`useMutation`) + BFF `GET /files` 연동으로 교체
- `Dropzone`의 console.log를 실제 `POST /files` multipart 업로드로 교체
- 업로드 후 `GET /files/{id}` 3초 간격 polling으로 indexing → ready 전환 감지
- 파일 삭제를 `DELETE /files/{id}` 실제 호출로 교체
- `(app)/layout.tsx` 인증 가드를 Server Component 쿠키 확인 + redirect로 교체
- `(public)/login/page.tsx`에 인증 사용자 `/docs` redirect 추가
- `mock-data.ts` 제거
- `DocStatus` 타입을 백엔드 실제 값(`pending | indexing | ready | error`)으로 확장

## Capabilities

### New Capabilities

- `session-guard`: Server Component 쿠키 기반 보호 라우트 접근 제어·미인증 redirect·인증 사용자 공개 라우트 redirect

### Modified Capabilities

- `auth-integration` (기존 `login-page`, `shared-layout` 영향): 회원가입·로그인·SSO 콜백·토큰 BFF 쿠키 저장·자동 갱신·`/auth/me` 유저 정보·로그아웃
- `file-integration` (기존 `doc-upload-page` 영향): 파일 업로드(BFF multipart, 50MB 제한, 확장자 검증)·목록 조회·삭제·다운로드 URL·indexing 상태 polling

## Impact

```
src/features/auth/components/LoginCard.tsx
src/features/auth/api.ts                     (신규)
src/features/auth/queries.ts                 (신규)
src/features/auth/store.ts                   (신규)
src/features/auth/types.ts
src/features/docs/components/DocList.tsx
src/features/docs/components/Dropzone.tsx
src/features/docs/api.ts                     (신규)
src/features/docs/queries.ts                 (신규)
src/features/docs/types.ts
src/features/docs/mock-data.ts               (제거)
src/components/layout/Sidebar.tsx
src/app/(app)/layout.tsx
src/app/(public)/login/page.tsx
src/app/(public)/auth/callback/page.tsx      (신규)
src/app/api/[...proxy]/route.ts
src/lib/api.ts
src/lib/api-server.ts
src/lib/query-keys/auth.ts                  (신규)
src/lib/query-keys/files.ts                 (신규)
```

## Meta

- feature: api-integration
- type: frontend
- package: frontend
- design-ref: none

프리로드: folder-conventions.md · dev-flow.md · forbidden-patterns.md
