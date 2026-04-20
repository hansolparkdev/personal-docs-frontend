## 1. 인프라 — BFF Proxy 및 fetcher 기반 세팅

- [ ] 1.1 BFF Route Handler 프록시 구현
  - 수정 파일: `src/app/api/[...proxy]/route.ts`
- [ ] 1.2 클라이언트 fetcher BFF 경유 구현 (baseURL `/api/`, 쿠키 자동 포함)
  - 수정 파일: `src/lib/api.ts`
- [ ] 1.3 서버 fetcher 백엔드 직접 호출 구현 (서버 환경변수 `BACKEND_URL` 사용)
  - 수정 파일: `src/lib/api-server.ts`
- [ ] 1.4 Query Key 팩토리 생성
  - 수정 파일: `src/lib/query-keys/auth.ts`
  - 수정 파일: `src/lib/query-keys/files.ts`

## 2. 인증 — 토큰 저장 및 BFF Set-Cookie

- [ ] 2.1 BFF 로그인 엔드포인트: `POST /auth/login` 백엔드 호출 후 HttpOnly 쿠키 Set-Cookie
  - 수정 파일: `src/app/api/[...proxy]/route.ts`
- [ ] 2.2 BFF 회원가입 엔드포인트: `POST /auth/register` 백엔드 호출
  - 수정 파일: `src/app/api/[...proxy]/route.ts`
- [ ] 2.3 BFF 토큰 refresh 엔드포인트: `POST /auth/refresh` 백엔드 호출 후 쿠키 갱신
  - 수정 파일: `src/app/api/[...proxy]/route.ts`
- [ ] 2.4 BFF 로그아웃 엔드포인트: 쿠키 삭제
  - 수정 파일: `src/app/api/[...proxy]/route.ts`
- [ ] 2.5 auth feature API 함수 구현 (login, register, logout, refreshToken, getMe)
  - 수정 파일: `src/features/auth/api.ts`
- [ ] 2.6 auth TanStack Query hooks 구현 (useMeQuery, useLoginMutation, useRegisterMutation, useLogoutMutation)
  - 수정 파일: `src/features/auth/queries.ts`
- [ ] 2.7 auth 타입 정의 업데이트 (`LoginFormValues` email → username, `RegisterFormValues`, `UserResponse`, `TokenResponse` 추가)
  - 수정 파일: `src/features/auth/types.ts`

## 3. 인증 — LoginCard 및 회원가입 UI 연동

- [ ] 3.1 LoginCard: email 필드 → username으로 변경, `useLoginMutation` 연동, 에러 메시지 표시, 성공 시 `/docs` redirect
  - 수정 파일: `src/features/auth/components/LoginCard.tsx`
- [ ] 3.2 LoginCard에 회원가입 폼 탭/모드 추가, `useRegisterMutation` 연동
  - 수정 파일: `src/features/auth/components/LoginCard.tsx`
- [ ] 3.3 로딩·에러·빈 상태 처리 (로그인·회원가입 뮤테이션 pending/error)
  - 수정 파일: `src/features/auth/components/LoginCard.tsx`

## 4. SSO 콜백 페이지

- [ ] 4.1 SSO 콜백 페이지 신규 생성 (`code` 파라미터 수신 → BFF `GET /auth/callback` 호출 → 쿠키 저장 → `/docs` redirect)
  - 수정 파일: `src/app/(public)/auth/callback/page.tsx`
- [ ] 4.2 LoginCard SSO 버튼의 redirect_uri를 `/auth/callback`으로 연결
  - 수정 파일: `src/features/auth/components/LoginCard.tsx`

## 5. 세션 가드 — layout 인증 확인

- [ ] 5.1 `(app)/layout.tsx` Server Component에서 `cookies()` + `lib/api-server.ts`로 `GET /auth/me` 호출 → 실패 시 `redirect('/login')`
  - 수정 파일: `src/app/(app)/layout.tsx`
- [ ] 5.2 `(public)/login/page.tsx`에서 인증 쿠키 존재 확인 → 있으면 `redirect('/docs')`
  - 수정 파일: `src/app/(public)/login/page.tsx`

## 6. 사이드바 유저 정보 연동

- [ ] 6.1 Sidebar에서 하드코딩 유저 제거, `useMeQuery` 훅으로 실제 유저 데이터 표시
  - 수정 파일: `src/components/layout/Sidebar.tsx`
- [ ] 6.2 Sidebar 로그아웃 버튼에 `useLogoutMutation` 연동, 성공 시 `/login` redirect
  - 수정 파일: `src/components/layout/Sidebar.tsx`
- [ ] 6.3 Sidebar 유저 정보 로딩·에러 상태 처리
  - 수정 파일: `src/components/layout/Sidebar.tsx`

## 7. 파일 — API 함수 및 Query 훅

- [ ] 7.1 files feature API 함수 구현 (uploadFile, listFiles, getFile, deleteFile, getDownloadUrl)
  - 수정 파일: `src/features/docs/api.ts`
- [ ] 7.2 files TanStack Query hooks 구현 (useFilesQuery, useFileQuery, useUploadFileMutation, useDeleteFileMutation)
  - 수정 파일: `src/features/docs/queries.ts`
- [ ] 7.3 DocStatus 타입을 `'pending' | 'indexing' | 'ready' | 'error'`로 확장
  - 수정 파일: `src/features/docs/types.ts`

## 8. 파일 — DocList TanStack Query 교체

- [ ] 8.1 DocList의 `useState` 목업 배열 제거, `useFilesQuery` 연동
  - 수정 파일: `src/features/docs/components/DocList.tsx`
- [ ] 8.2 DocList 삭제 버튼에 `useDeleteFileMutation` 연동, 성공 시 목록 캐시 무효화
  - 수정 파일: `src/features/docs/components/DocList.tsx`
- [ ] 8.3 DocList 로딩·에러·빈 상태 처리
  - 수정 파일: `src/features/docs/components/DocList.tsx`
- [ ] 8.4 파일별 status polling 구현 (`useFileQuery`에 `refetchInterval` 3000ms, ready/error 시 중단)
  - 수정 파일: `src/features/docs/queries.ts`
- [ ] 8.5 DocList에서 indexing 중인 파일에 상태 배지 표시 (polling 결과 반영)
  - 수정 파일: `src/features/docs/components/DocList.tsx`

## 9. 파일 — Dropzone 실제 업로드 연동

- [ ] 9.1 Dropzone의 `onDrop` console.log 제거, `useUploadFileMutation` 연동
  - 수정 파일: `src/features/docs/components/Dropzone.tsx`
- [ ] 9.2 파일 확장자 클라이언트 검증 (지원 확장자 목록 타입 정의)
  - 수정 파일: `src/features/docs/components/Dropzone.tsx`
- [ ] 9.3 50MB 초과 파일 클라이언트 검증 및 에러 메시지 표시
  - 수정 파일: `src/features/docs/components/Dropzone.tsx`
- [ ] 9.4 업로드 진행 상태 표시 (pending 시 로딩 인디케이터)
  - 수정 파일: `src/features/docs/components/Dropzone.tsx`

## 10. 파일 — 다운로드

- [ ] 10.1 DocList에 다운로드 버튼 추가, `GET /files/{id}/download` 호출 후 presigned URL로 이동
  - 수정 파일: `src/features/docs/components/DocList.tsx`

## 11. 목업 데이터 제거

- [ ] 11.1 `mock-data.ts` 파일 제거
  - 수정 파일: `src/features/docs/mock-data.ts`
- [ ] 11.2 챗 페이지에 "챗 기능 준비 중" 안내 텍스트 추가 (목업 AI 응답 유지)
  - 수정 파일: `src/app/(app)/chat/page.tsx`

## 12. 토큰 자동 갱신

- [ ] 12.1 클라이언트 fetcher에 401 응답 시 `POST /auth/refresh` 호출 후 재시도 인터셉터 구현
  - 수정 파일: `src/lib/api.ts`
- [ ] 12.2 refresh 실패 시 쿠키 삭제 + `/login` redirect 처리
  - 수정 파일: `src/lib/api.ts`
