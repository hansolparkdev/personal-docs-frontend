# Spec: shared-layout

## ADDED Requirements

### Requirement: sidebar-renders

**Description**: 인증 영역(`(app)`)에서 Sidebar 가 모든 페이지에 항상 렌더링된다. Sidebar 는 WordMark, "새 챗 시작" CTA, 내비게이션(내 문서·챗), 최근 대화 목록, 유저 푸터(로그아웃)로 구성된다.

**Scenarios**:

#### Scenario: 사이드바 기본 렌더링

- **Given**: `(app)` 레이아웃 안의 임의 페이지를 방문한 상태
- **When**: 페이지가 렌더링되면
- **Then**: WordMark 가 사이드바 상단에 보인다
- **And**: "새 챗 시작" 버튼이 보인다
- **And**: "내 문서" 메뉴와 "챗" 메뉴가 보인다
- **And**: 최근 대화 목록이 보인다 (목업 3개)
- **And**: 사이드바 하단에 유저 이름과 로그아웃 버튼이 보인다

#### Scenario: 사이드바 폭 및 구조

- **Given**: `(app)` 레이아웃
- **When**: 화면이 렌더링되면
- **Then**: Sidebar 는 260px 고정 폭으로 좌측에 배치된다
- **And**: 나머지 콘텐츠 영역은 Sidebar 오른쪽에서 flex-1 로 확장된다

---

### Requirement: active-nav-indicator

**Description**: 현재 방문 중인 페이지에 해당하는 사이드바 네비게이션 항목이 활성 스타일로 표시된다.

**Scenarios**:

#### Scenario: /docs 에서 "내 문서" 활성 표시

- **Given**: 현재 경로가 `/docs` 인 상태
- **When**: 사이드바 네비게이션을 보면
- **Then**: "내 문서" 항목이 accent 배경(`var(--bg-accent)`) + fg-primary 텍스트 스타일로 표시된다
- **And**: "챗" 항목은 기본 스타일(비활성)로 표시된다

#### Scenario: /chat 에서 "챗" 활성 표시

- **Given**: 현재 경로가 `/chat` 인 상태
- **When**: 사이드바 네비게이션을 보면
- **Then**: "챗" 항목이 활성 스타일로 표시된다
- **And**: "내 문서" 항목은 기본 스타일로 표시된다

---

### Requirement: new-chat-cta

**Description**: "새 챗 시작" CTA 버튼을 클릭하면 `/chat` 으로 이동한다.

**Scenarios**:

#### Scenario: 새 챗 시작 버튼 클릭

- **Given**: 사이드바가 렌더링된 상태
- **When**: "새 챗 시작" 버튼을 클릭하면
- **Then**: `/chat` 페이지로 이동한다

---

### Requirement: sidebar-logout

**Description**: 사이드바 유저 푸터의 로그아웃 버튼을 클릭하면 `/login` 으로 이동한다.

**Scenarios**:

#### Scenario: 로그아웃 버튼 클릭

- **Given**: 사이드바 하단 유저 푸터가 보이는 상태
- **When**: 로그아웃 버튼(또는 아이콘)을 클릭하면
- **Then**: `/login` 으로 이동한다 (목업 — Next.js router.push)

---

### Requirement: recent-chats-empty-state

**Description**: 최근 대화가 없을 때 빈 상태 문구를 표시한다.

**Scenarios**:

#### Scenario: 최근 대화 빈 상태

- **Given**: 최근 대화 목록이 비어 있는 상태
- **When**: 사이드바를 보면
- **Then**: "아직 대화 기록이 없어요" 문구가 표시된다

#### Scenario: 최근 대화 목업 표시

- **Given**: 목업 대화 3개가 있는 상태
- **When**: 사이드바를 보면
- **Then**: 대화 제목 3개가 최근 대화 섹션에 표시된다

---

### Requirement: app-layout-auth-guard

**Description**: 인증되지 않은 상태(목업 플래그 기준)에서 `(app)` 경로에 접근하면 `/login` 으로 리다이렉트된다.

**Scenarios**:

#### Scenario: 목업 가드 — 비인증 접근 차단

- **Given**: 목업 인증 플래그가 false 인 상태
- **When**: `(app)` 하위 경로에 접근하면
- **Then**: `/login` 으로 리다이렉트된다

#### Scenario: 목업 가드 — 인증 통과

- **Given**: 목업 인증 플래그가 true(기본값) 인 상태
- **When**: `(app)` 하위 경로에 접근하면
- **Then**: 해당 페이지가 정상 렌더링된다
