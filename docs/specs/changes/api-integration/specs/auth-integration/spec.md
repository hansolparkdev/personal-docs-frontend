## MODIFIED Requirements

기존 `login-page` 및 `shared-layout` capability에 영향을 미치는 인증 연동 요구사항.

---

### Requirement: 로그인 — 실제 API 연동

사용자가 username/password를 입력하면 BFF를 통해 `POST /api/v1/auth/login`을 호출하고, 성공 시 access_token·refresh_token을 HttpOnly 쿠키로 저장한 뒤 `/docs`로 이동한다. LoginCard의 `email` 필드는 `username`으로 교체한다.

#### Scenario: 로그인 성공

- **Given** 사용자가 `/login` 페이지에 있고 올바른 username과 password를 입력했다
- **When** 로그인 버튼을 클릭한다
- **Then** BFF가 백엔드 `POST /auth/login`을 호출하고 `TokenResponse`를 수신한다
- **And** BFF가 `Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Lax` 헤더로 응답한다
- **And** 브라우저가 `/docs`로 이동한다

#### Scenario: 로그인 실패 — 잘못된 자격증명

- **Given** 사용자가 `/login` 페이지에 있고 잘못된 username 또는 password를 입력했다
- **When** 로그인 버튼을 클릭한다
- **Then** 백엔드가 401을 반환한다
- **And** LoginCard에 "아이디 또는 비밀번호가 올바르지 않습니다." 에러 메시지가 표시된다
- **And** 페이지 이동이 발생하지 않는다

#### Scenario: 로그인 중 로딩 상태

- **Given** 사용자가 로그인 버튼을 클릭했다
- **When** API 요청이 진행 중이다
- **Then** 로그인 버튼이 비활성화되고 로딩 인디케이터가 표시된다

---

### Requirement: 회원가입 — 실제 API 연동

사용자가 회원가입 폼에 username·email·password·name을 입력하면 `POST /api/v1/auth/register`를 호출한다. 성공 시 자동으로 로그인 처리(`POST /auth/login`)하여 `/docs`로 이동한다.

#### Scenario: 회원가입 성공 — 자동 로그인

- **Given** 사용자가 로그인 화면의 회원가입 탭에서 올바른 정보를 입력했다
- **When** 회원가입 버튼을 클릭한다
- **Then** BFF가 `POST /auth/register`를 호출하고 성공 응답을 수신한다
- **And** 이어서 자동으로 `POST /auth/login`을 호출하여 토큰 쿠키를 저장한다
- **And** 브라우저가 `/docs`로 이동한다

#### Scenario: 회원가입 실패 — 중복 username

- **Given** 사용자가 이미 존재하는 username으로 회원가입을 시도했다
- **When** 회원가입 버튼을 클릭한다
- **Then** 백엔드가 409를 반환한다
- **And** "이미 사용 중인 아이디입니다." 에러 메시지가 표시된다

---

### Requirement: SSO 로그인 — Keycloak redirect 및 콜백

사용자가 SSO 버튼을 클릭하면 Keycloak 인증 페이지로 이동하고, 인증 후 `/auth/callback`으로 돌아와 authorization code를 토큰으로 교환한다.

#### Scenario: SSO 버튼 클릭 — Keycloak redirect

- **Given** 사용자가 `/login` 페이지에 있다
- **When** SSO(Keycloak) 버튼을 클릭한다
- **Then** 브라우저가 `redirect_uri=/auth/callback`을 포함한 Keycloak 인증 URL로 이동한다

#### Scenario: SSO 콜백 — 토큰 교환 성공

- **Given** Keycloak 인증 후 브라우저가 `/auth/callback?code=<code>` URL로 돌아왔다
- **When** 콜백 페이지가 마운트된다
- **Then** BFF가 `GET /auth/callback?code=<code>&redirect_uri=/auth/callback`을 백엔드로 전달한다
- **And** 백엔드가 `TokenResponse`를 반환하면 BFF가 HttpOnly 쿠키로 저장한다
- **And** 브라우저가 `/docs`로 이동한다

#### Scenario: SSO 콜백 — 토큰 교환 실패

- **Given** Keycloak에서 유효하지 않은 code가 반환됐다
- **When** 콜백 페이지가 BFF를 통해 토큰 교환을 시도한다
- **Then** 에러 메시지와 함께 `/login`으로 redirect된다

---

### Requirement: 토큰 자동 갱신 — 401 인터셉터

access_token이 만료되어 API 요청이 401을 반환하면, 클라이언트 fetcher가 자동으로 refresh_token으로 토큰을 갱신하고 원래 요청을 재시도한다.

#### Scenario: 토큰 만료 — 갱신 후 재시도

- **Given** 사용자가 보호 페이지에서 API를 호출했다
- **When** access_token 만료로 API가 401을 반환한다
- **Then** 클라이언트 fetcher가 `POST /auth/refresh`를 호출한다
- **And** 갱신된 토큰이 쿠키에 저장된다
- **And** 원래 API 요청이 새 토큰으로 재시도된다
- **And** 사용자는 중단 없이 작업을 계속할 수 있다

#### Scenario: 토큰 만료 — refresh 실패 시 로그인 이동

- **Given** access_token과 refresh_token이 모두 만료됐다
- **When** refresh 요청도 401을 반환한다
- **Then** 쿠키가 삭제된다
- **And** 브라우저가 `/login`으로 이동한다

---

### Requirement: 사이드바 유저 정보 — 실제 API 연동

`Sidebar` 컴포넌트의 하드코딩 유저 정보를 제거하고 `GET /auth/me`로 실제 사용자 정보를 표시한다.

#### Scenario: 사이드바 유저 정보 표시

- **Given** 사용자가 인증된 상태로 보호 페이지에 있다
- **When** 사이드바가 렌더링된다
- **Then** `GET /auth/me` 응답의 `name`과 `email`이 사이드바 하단 유저 푸터에 표시된다

#### Scenario: 사이드바 유저 정보 로딩 중

- **Given** `GET /auth/me` 요청이 진행 중이다
- **When** 사이드바가 렌더링된다
- **Then** 유저 푸터 영역에 스켈레톤 또는 로딩 상태가 표시된다

---

### Requirement: 로그아웃

사용자가 사이드바 로그아웃 버튼을 클릭하면 BFF가 쿠키를 삭제하고 `/login`으로 이동한다.

#### Scenario: 로그아웃 성공

- **Given** 사용자가 사이드바에서 로그아웃 버튼을 클릭했다
- **When** BFF 로그아웃 엔드포인트가 호출된다
- **Then** access_token·refresh_token 쿠키가 삭제된다
- **And** 브라우저가 `/login`으로 이동한다
