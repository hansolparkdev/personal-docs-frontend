# Spec: login-page

## ADDED Requirements

### Requirement: login-card-renders

**Description**: `/login` 진입 시 neutral-50 배경 위에 로그인 카드가 수직·수평 중앙에 렌더링된다. 카드는 이메일 입력, 비밀번호 입력, "로그인" 버튼, "Keycloak 계정으로 계속하기" 버튼으로 구성된다.

**Scenarios**:

#### Scenario: 로그인 폼 표시

- **Given**: `/login` 경로에 진입한 상태
- **When**: 페이지가 로드되면
- **Then**: 이메일 입력 필드가 보인다
- **And**: 비밀번호 입력 필드가 보인다
- **And**: "로그인" 버튼이 보인다
- **And**: "Keycloak 계정으로 계속하기" 버튼이 보인다

#### Scenario: 카드 레이아웃

- **Given**: `/login` 페이지가 렌더링된 상태
- **When**: 화면을 보면
- **Then**: 배경색이 neutral-50(`var(--bg-subtle)`)이다
- **And**: 로그인 카드는 rounded-xl(14px) 테두리 반경과 border-default 테두리를 가진다
- **And**: 카드에 그림자가 없다(shadow-none)

---

### Requirement: login-form-submit

**Description**: 이메일과 비밀번호를 입력하고 로그인 버튼을 클릭(또는 폼 제출)하면 `/docs` 로 이동한다. 목업이므로 항상 성공으로 처리한다.

**Scenarios**:

#### Scenario: 로그인 버튼 클릭 → /docs 이동

- **Given**: 이메일 필드와 비밀번호 필드에 값이 입력된 상태
- **When**: "로그인" 버튼을 클릭하면
- **Then**: `/docs` 로 이동한다 (목업 — 항상 성공)

#### Scenario: Enter 키 폼 제출 → /docs 이동

- **Given**: 이메일·비밀번호가 입력된 상태에서 비밀번호 필드에 포커스
- **When**: Enter 키를 누르면
- **Then**: `/docs` 로 이동한다

#### Scenario: 빈 폼 제출 방지

- **Given**: 이메일 또는 비밀번호 필드가 비어 있는 상태
- **When**: "로그인" 버튼을 보면
- **Then**: 버튼이 disabled 상태이거나 HTML required 검증이 동작한다

---

### Requirement: sso-button

**Description**: "Keycloak 계정으로 계속하기" 버튼을 클릭하면 `/docs` 로 이동한다. 목업이므로 실제 Keycloak 리다이렉트 없이 바로 이동한다.

**Scenarios**:

#### Scenario: SSO 버튼 클릭 → /docs 이동

- **Given**: 로그인 카드가 보이는 상태
- **When**: "Keycloak 계정으로 계속하기" 버튼을 클릭하면
- **Then**: `/docs` 로 이동한다 (목업)

---

### Requirement: login-page-no-sidebar

**Description**: 로그인 페이지는 공개 영역(`(public)`)에 속하므로 Sidebar 가 표시되지 않는다.

**Scenarios**:

#### Scenario: 사이드바 미표시

- **Given**: `/login` 페이지에 있는 상태
- **When**: 페이지를 보면
- **Then**: Sidebar 컴포넌트가 렌더링되지 않는다
