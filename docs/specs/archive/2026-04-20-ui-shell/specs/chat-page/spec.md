# Spec: chat-page

## ADDED Requirements

### Requirement: chat-renders

**Description**: `/chat` 진입 시 시드 대화(user 버블 1개 + AI 버블 1개)와 Composer 가 렌더링된다. AI 버블에는 출처 인용 칩 2개가 포함된다.

**Scenarios**:

#### Scenario: 시드 대화 표시

- **Given**: `/chat` 경로에 진입한 상태
- **When**: 페이지가 로드되면
- **Then**: user 버블 1개가 보인다
- **And**: AI 버블 1개가 보인다
- **And**: AI 버블 하단에 출처 인용 칩 2개가 보인다 (예: "[문서명 · p.3]" 형태)
- **And**: Composer(텍스트 입력 + 전송 버튼)가 하단에 보인다

#### Scenario: 버블 시각적 구분

- **Given**: 메시지 목록이 렌더링된 상태
- **When**: 버블들을 보면
- **Then**: user 버블은 우측 정렬, accent 계열 배경으로 표시된다
- **And**: AI 버블은 좌측 정렬, surface 배경(white)으로 표시된다

---

### Requirement: message-send

**Description**: Composer 에 텍스트를 입력하고 전송하면 user 버블이 추가되고, 약 700ms 후 AI 더미 응답 버블이 추가된다.

**Scenarios**:

#### Scenario: 메시지 전송 — 버튼 클릭

- **Given**: Composer 에 텍스트가 입력된 상태
- **When**: 전송 버튼을 클릭하면
- **Then**: 입력한 텍스트가 user 버블로 MessageList 에 추가된다
- **And**: Composer 입력창이 비워진다
- **And**: 약 700ms 후 AI 더미 응답 버블이 MessageList 에 추가된다

#### Scenario: 메시지 전송 — Enter 키

- **Given**: Composer 에 텍스트가 입력된 상태
- **When**: Enter 키를 누르면 (Shift+Enter 제외)
- **Then**: user 버블이 추가되고 전송 버튼 클릭과 동일하게 동작한다

#### Scenario: Shift+Enter — 줄바꿈

- **Given**: Composer 에 텍스트가 입력된 상태
- **When**: Shift+Enter 키를 누르면
- **Then**: 줄바꿈이 입력되고 전송되지 않는다

---

### Requirement: composer-disabled-when-empty

**Description**: Composer 가 비어 있을 때 전송 버튼은 disabled 상태다.

**Scenarios**:

#### Scenario: 빈 입력 시 전송 버튼 비활성

- **Given**: Composer 입력창이 비어 있는 상태
- **When**: 전송 버튼을 보면
- **Then**: 전송 버튼이 disabled 상태로 표시된다 (`aria-disabled` 또는 `disabled` 속성 적용)

#### Scenario: 텍스트 입력 후 전송 버튼 활성

- **Given**: Composer 입력창이 비어 있는 상태
- **When**: 텍스트를 입력하면
- **Then**: 전송 버튼이 활성 상태로 변경된다

#### Scenario: 공백만 입력 시 전송 버튼 비활성

- **Given**: Composer 에 공백 문자만 입력된 상태
- **When**: 전송 버튼을 보면
- **Then**: 전송 버튼이 disabled 상태로 표시된다

---

### Requirement: chat-empty-state

**Description**: 메시지가 없는 새 챗 상태에서 빈 상태 안내 UI 가 표시된다.

**Scenarios**:

#### Scenario: 빈 채팅 상태 표시

- **Given**: 메시지 목록이 비어 있는 새 챗 상태
- **When**: 챗 화면이 열리면
- **Then**: 빈 상태 아이콘이 중앙에 표시된다
- **And**: "업로드한 문서에 대해 무엇이든 물어보세요" 문구가 표시된다
- **And**: 예시 질문 3개가 클릭 가능한 형태로 표시된다

#### Scenario: 예시 질문 클릭 → Composer 에 채우기

- **Given**: 빈 상태에서 예시 질문 3개가 보이는 상태
- **When**: 예시 질문 중 하나를 클릭하면
- **Then**: 해당 질문 텍스트가 Composer 입력창에 채워진다

---

### Requirement: citation-chips

**Description**: AI 응답 버블 하단에 출처 인용 칩이 표시된다. 칩은 `[문서명 · p.N]` 형태의 텍스트를 가진 Badge 로 구현된다.

**Scenarios**:

#### Scenario: 출처 칩 렌더링

- **Given**: citations 배열이 있는 AI 버블
- **When**: AI 버블을 보면
- **Then**: 각 citation 이 `[문서명 · p.N]` 형태의 칩으로 표시된다
- **And**: 칩은 rounded-full 테두리 outline 스타일이다

#### Scenario: 출처 없는 AI 버블

- **Given**: citations 배열이 비어 있는 AI 버블
- **When**: AI 버블을 보면
- **Then**: 출처 칩 영역이 표시되지 않는다 (렌더링 생략)
