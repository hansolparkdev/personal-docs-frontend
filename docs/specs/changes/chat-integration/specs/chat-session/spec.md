## ADDED Requirements

### Requirement: 새 세션 생성

사용자가 Sidebar에서 "새 챗 시작"을 클릭하면 `POST /chats`를 호출해 세션을 생성하고 해당 세션으로 이동한다.

#### Scenario: 새 챗 시작 버튼 클릭

- **Given** 로그인된 사용자가 챗 화면에 있고 Sidebar가 렌더링되어 있다
- **When** Sidebar의 "새 챗 시작" 버튼을 클릭한다
- **Then** `POST /api/chats`가 호출되고 201 응답으로 세션 ID를 받는다
- **And** 브라우저가 `/chat?session={새 세션 id}`로 이동한다
- **And** Sidebar 최근 대화 목록이 갱신되어 새 세션이 포함된다

#### Scenario: 세션 생성 API 실패

- **Given** 로그인된 사용자가 "새 챗 시작"을 클릭했다
- **When** `POST /api/chats`가 오류(4xx/5xx)를 반환한다
- **Then** 화면 이동이 발생하지 않는다
- **And** 사용자에게 오류 안내 메시지가 표시된다
- **And** Sidebar 상태가 이전과 동일하게 유지된다

---

### Requirement: 세션 목록 조회 및 Sidebar 표시

Sidebar가 마운트될 때 `GET /chats`를 호출해 세션 목록을 표시한다.

#### Scenario: 세션 목록 정상 로드

- **Given** 로그인된 사용자가 챗 화면에 진입한다
- **When** Sidebar가 마운트된다
- **Then** `GET /api/chats`가 호출된다
- **And** 반환된 세션 목록이 Sidebar "최근 대화" 영역에 표시된다
- **And** `title`이 null인 세션은 "새 대화"로 표시된다
- **And** `title`이 있는 세션은 해당 제목이 표시된다

#### Scenario: 세션 목록이 비어있는 경우

- **Given** 사용자에게 저장된 세션이 없다
- **When** Sidebar가 마운트되어 `GET /api/chats`를 호출한다
- **Then** 빈 목록 상태가 표시된다 (로딩·에러 없음)

#### Scenario: 세션 목록 API 실패

- **Given** 네트워크 오류 등으로 `GET /api/chats`가 실패한다
- **When** Sidebar가 마운트된다
- **Then** 최근 대화 영역에 오류 안내가 표시된다
- **And** 다른 UI 영역이 깨지지 않는다

---

### Requirement: 기존 세션 진입 및 메시지 히스토리 복원

Sidebar에서 기존 세션을 클릭하면 해당 세션의 메시지 히스토리를 로드해 표시한다.

#### Scenario: 기존 세션 클릭

- **Given** Sidebar에 세션 목록이 표시되어 있다
- **When** 특정 세션 항목을 클릭한다
- **Then** 브라우저가 `/chat?session={session_id}`로 이동한다
- **And** `GET /api/chats/{session_id}`가 호출된다
- **And** 해당 세션의 전체 메시지가 MessageList에 시간순으로 표시된다

#### Scenario: 새로고침 후 세션 복원

- **Given** 사용자가 `/chat?session={session_id}` URL로 진입한다 (새로고침 포함)
- **When** 페이지가 로드된다
- **Then** `useSessionQuery`가 해당 session_id로 `GET /api/chats/{session_id}`를 호출한다
- **And** 전체 메시지 히스토리가 복원되어 표시된다

#### Scenario: 존재하지 않는 session_id로 진입

- **Given** URL에 유효하지 않은 session_id가 포함되어 있다
- **When** `GET /api/chats/{session_id}`가 404를 반환한다
- **Then** 오류 안내가 표시되고 새 세션을 시작하도록 유도한다

---

### Requirement: 세션 삭제

Sidebar에서 세션을 삭제하면 목록에서 제거된다.

#### Scenario: 세션 삭제 성공

- **Given** Sidebar에 세션 목록이 표시되어 있다
- **When** 특정 세션의 삭제 버튼을 클릭한다
- **Then** `DELETE /api/chats/{session_id}`가 호출되고 204를 반환한다
- **And** `useSessionsQuery` 캐시가 무효화되어 목록이 갱신된다
- **And** 삭제된 세션이 Sidebar에서 사라진다

#### Scenario: 현재 열람 중인 세션 삭제

- **Given** 사용자가 `/chat?session={session_id}`를 열람 중이다
- **When** 해당 세션을 Sidebar에서 삭제한다
- **Then** 삭제 성공 후 빈 챗 화면 또는 다른 세션으로 전환된다

#### Scenario: 세션 삭제 API 실패

- **Given** `DELETE /api/chats/{session_id}`가 오류를 반환한다
- **When** 사용자가 삭제를 시도했다
- **Then** 세션이 목록에서 제거되지 않는다
- **And** 오류 안내 메시지가 표시된다

## MODIFIED Requirements

### Requirement: shared-layout Sidebar 최근 대화 (MODIFIED — shared-layout capability)

기존 `MOCK_RECENT_CHATS` 하드코딩 데이터를 `useSessionsQuery` 실제 API 연동으로 교체한다.

#### Scenario: 하드코딩 데이터 제거

- **Given** `src/app/(app)/layout.tsx`에 `MOCK_RECENT_CHATS` 상수가 존재한다
- **When** 변경이 적용된다
- **Then** `MOCK_RECENT_CHATS`가 제거되고 Sidebar가 자체적으로 세션 쿼리를 수행한다
- **And** Sidebar에 prop으로 하드코딩 데이터가 주입되지 않는다
