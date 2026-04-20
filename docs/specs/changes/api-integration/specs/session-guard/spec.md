## ADDED Requirements

기존 `shared-layout` capability에 영향을 미치는 세션 기반 접근 제어 요구사항. `middleware.ts` 금지 규칙에 따라 Server Component layout에서 처리한다.

---

### Requirement: 보호 라우트 접근 제어 — 미인증 사용자 차단

`(app)` 라우트 그룹의 `layout.tsx`에서 Server Component가 `cookies()` API로 access_token 쿠키를 확인하고, 유효한 세션이 없으면 `/login`으로 redirect한다.

#### Scenario: 미인증 사용자 — 보호 페이지 직접 접근

- **Given** 사용자가 access_token 쿠키 없이 브라우저 주소창에 `/docs`를 입력했다
- **When** `(app)/layout.tsx` Server Component가 렌더링된다
- **Then** `cookies()`에서 access_token이 없음을 확인한다
- **And** `redirect('/login')`이 호출된다
- **And** 보호 페이지 콘텐츠는 렌더링되지 않는다

#### Scenario: 미인증 사용자 — 만료된 토큰으로 접근

- **Given** 사용자가 만료된 access_token 쿠키를 가진 상태로 `/docs`에 접근했다
- **When** `(app)/layout.tsx`에서 `lib/api-server.ts`로 `GET /auth/me`를 호출한다
- **Then** 백엔드가 401을 반환한다
- **And** `redirect('/login')`이 호출된다

#### Scenario: 인증 사용자 — 보호 페이지 정상 접근

- **Given** 사용자가 유효한 access_token 쿠키를 가진 상태로 `/docs`에 접근했다
- **When** `(app)/layout.tsx`에서 `GET /auth/me`가 성공한다
- **Then** 보호 페이지 콘텐츠가 정상적으로 렌더링된다

---

### Requirement: 공개 라우트 접근 제어 — 인증 사용자 redirect

이미 로그인한 사용자가 `/login`에 접근하면 `/docs`로 자동 redirect된다.

#### Scenario: 인증 사용자 — 로그인 페이지 접근 시 앱으로 이동

- **Given** 사용자가 유효한 access_token 쿠키를 가진 상태로 `/login`에 접근했다
- **When** `(public)/login/page.tsx` Server Component가 렌더링된다
- **Then** 쿠키 존재 여부를 확인한다
- **And** `redirect('/docs')`가 호출된다
- **And** 로그인 화면 콘텐츠는 렌더링되지 않는다

#### Scenario: 미인증 사용자 — 로그인 페이지 정상 접근

- **Given** 사용자가 access_token 쿠키 없이 `/login`에 접근했다
- **When** `(public)/login/page.tsx`가 렌더링된다
- **Then** 쿠키가 없음을 확인한다
- **And** 로그인 화면 콘텐츠가 정상적으로 렌더링된다

---

### Requirement: SSO 콜백 — 공개 라우트 접근 허용

`/auth/callback` 페이지는 인증 전 상태에서 Keycloak이 redirect하는 공개 라우트이므로 `(public)` 그룹에 배치하여 세션 가드 없이 접근 가능해야 한다.

#### Scenario: SSO 콜백 페이지 — 미인증 상태 접근 허용

- **Given** 사용자가 Keycloak 인증 후 `/auth/callback?code=<code>`로 redirect됐다
- **When** `(public)/auth/callback/page.tsx`가 렌더링된다
- **Then** 세션 가드 redirect가 발생하지 않는다
- **And** 페이지가 `code` 파라미터를 처리하여 토큰 교환 흐름을 시작한다
