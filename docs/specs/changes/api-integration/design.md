## Context

프론트엔드는 Next.js 15 App Router 기반으로 `(app)` / `(public)` 라우트 그룹이 분리되어 있다. 현재 인증·파일·유저 정보가 전부 목업이며, BFF Route Handler(`app/api/[...proxy]/`)는 뼈대만 존재한다. 백엔드 FastAPI는 `/api/v1` 하위에 인증·파일 엔드포인트가 준비된 상태다. 연동 시 토큰 저장 방식, 필드 불일치, 상태 관리 교체, 세션 가드 방식 결정이 필요하다.

## Goals / Non-Goals

**Goals:**
- 목업을 실제 백엔드 API 호출로 교체하여 회원가입·로그인·파일 관리가 실제 동작
- 보안 규칙(토큰 localStorage 금지, 백엔드 URL 브라우저 노출 금지)을 준수하는 연동 구조 확립
- Server Component 인증 가드로 미인증 접근 차단

**Non-Goals:**
- 챗(RAG) API 연동 — 백엔드 미제공, 챗 화면은 목업 유지
- 신규 UI 설계·디자인 변경
- 세션 만료 UX 고도화, 파일 공유, 관리자 기능

## Decisions

### 1. 토큰 저장 방식 — HttpOnly 쿠키, BFF Set-Cookie

forbidden-patterns에 `localStorage` / `sessionStorage` 토큰 저장이 명시적으로 금지되어 있다. BFF(`app/api/[...proxy]/`)가 백엔드 `TokenResponse`를 수신한 후 `Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Lax`로 응답한다. 브라우저 JS에서는 토큰에 접근할 수 없으므로 XSS에 의한 토큰 탈취를 차단한다. refresh_token도 동일하게 HttpOnly 쿠키로 저장한다.

**이유**: forbidden-patterns 준수, XSS 토큰 탈취 방지, Next.js Server Component에서 `cookies()` API로 직접 읽기 가능.

### 2. LoginCard 필드 — email → username

백엔드 `POST /auth/login` body는 `{ username, password }`이며, email을 식별자로 받지 않는다. 현재 `LoginFormValues.email` 필드와 불일치한다. `LoginFormValues`를 `{ username, password }`로 변경하고 UI 라벨·placeholder도 일치시킨다. 회원가입은 `{ username, email, password, name }` 별도 폼으로 처리한다.

**이유**: 백엔드 스펙 일치. 잘못된 필드를 그대로 두면 런타임에 인증 항상 실패.

### 3. 서버 상태 관리 — TanStack Query

forbidden-patterns에 `useEffect` fetch-on-render가 명시적으로 금지되어 있다. 파일 목록(`DocList`), 유저 정보(`Sidebar`), 파일 상세(polling)는 모두 `useQuery`·`useMutation`으로 관리한다. `DocList`의 `useState` 목업 배열을 제거하고 `useQuery(fileQueryKeys.list())`로 교체한다. 낙관적 업데이트는 `setState + await` 패턴 금지이므로 TanStack Query `onMutate` 방식만 사용한다.

**이유**: forbidden-patterns 준수, 캐시 무효화·리페치·로딩·에러 상태를 일관되게 처리.

### 4. BFF Proxy — 모든 API 호출은 `/api/[...proxy]/` 경유

forbidden-patterns에 `NEXT_PUBLIC_API_URL` 등 백엔드 URL 브라우저 노출이 금지되어 있다. 클라이언트 컴포넌트에서 직접 백엔드를 호출하지 않는다. `lib/api.ts`(클라이언트 fetcher)는 `/api/` prefix로 BFF를 호출하며, BFF Route Handler가 서버 환경변수 `BACKEND_URL`을 사용해 백엔드로 프록시한다. Server Component는 `lib/api-server.ts`를 통해 서버 측에서 직접 백엔드를 호출한다.

**이유**: forbidden-patterns 준수, 백엔드 URL이 브라우저 네트워크 탭에 노출되지 않음.

### 5. 파일 상태 Polling — 3초 간격, ready 도달 시 중단

업로드 직후 백엔드는 파일을 비동기로 인덱싱한다. `POST /files` 응답 후 즉시 status가 `ready`가 아닐 수 있으므로 `GET /files/{id}`를 polling한다. TanStack Query `refetchInterval`을 3000ms로 설정하고, status가 `ready` 또는 `error`가 되면 `refetchInterval: false`로 전환한다. 목록 전체 polling이 아닌 개별 파일 ID 단위로 polling하여 불필요한 요청을 최소화한다.

**이유**: 인덱싱 완료 시점을 사용자에게 즉시 반영. 무한 polling 방지.

### 6. SSO 콜백 페이지 — `/auth/callback` 신규 추가

백엔드 `GET /auth/callback?code=...&redirect_uri=...`는 Keycloak authorization code를 토큰으로 교환한다. 프론트엔드 콜백 페이지 `app/(public)/auth/callback/page.tsx`가 없으면 SSO 흐름이 완성되지 않는다. 이 페이지는 URL의 `code` 쿼리 파라미터를 읽어 BFF를 통해 토큰 교환을 수행하고, 성공 시 `/docs`로 이동한다. `redirect_uri`는 `${NEXT_PUBLIC_BASE_URL}/auth/callback`으로 고정한다.

**이유**: SSO 인증 흐름 완성에 필수. plan.md의 Open Questions에서 spec 단계 결정으로 위임된 사항.

### 7. 인증 가드 — Server Component 쿠키 확인 + redirect

현재 `(app)/layout.tsx`의 `const isAuthenticated = true` 목업을 제거한다. Server Component에서 `cookies()` API로 `access_token` 쿠키 존재 여부를 확인한다. 쿠키가 없으면 `redirect('/login')`을 호출한다. 쿠키 유효성 검증(서명·만료)은 `lib/api-server.ts`를 통해 `GET /auth/me`를 호출하여 수행한다. forbidden-patterns에 `middleware.ts` 사용이 금지되어 있으므로 layout에서 처리한다.

**이유**: forbidden-patterns의 middleware 금지 준수. Server Component에서 처리하면 클라이언트 번들에 가드 로직이 포함되지 않음.

### 8. 목업 데이터 제거 — API 연동 후 삭제

`src/features/docs/mock-data.ts`는 API 연동 완료 후 제거한다. `Sidebar`의 하드코딩 유저 객체, `chat/page.tsx`의 시드 메시지·딜레이 목업은 각각의 연동 태스크에서 함께 정리한다. 챗 화면은 이번 범위 외이므로 목업 AI 응답은 유지하되 "챗 기능 준비 중" 안내 텍스트를 추가한다.

**이유**: 목업과 실제 데이터가 혼재하면 버그 탐지가 어려워짐. 연동 완료 시점에 즉시 제거.

## Risks / Trade-offs

- **쿠키 SameSite=Lax + CORS**: 백엔드가 별도 도메인이면 BFF 경유로 해결되므로 문제 없음. 단, BFF와 프론트가 동일 Next.js 앱이므로 쿠키 설정만 올바르면 됨.
- **polling 비용**: 3초 간격 polling은 파일당 최대 수십 회 요청을 발생시킬 수 있음 → 파일 완료(ready/error) 즉시 중단으로 완화.
- **Server Component 가드 + 쿠키 만료**: access_token 쿠키가 있어도 실제 만료됐을 수 있음 → `GET /auth/me` 호출로 확인 후 실패 시 redirect로 완화.
- **LoginCard 필드 변경**: username 필드로 바꾸면 기존 이메일로 가입한 사용자는 username을 별도로 기억해야 함 → 백엔드 스펙이 username 기반이므로 프론트가 맞춰야 함, UX 안내 텍스트로 완화.
