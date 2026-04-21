## ADDED Requirements

### Requirement: SSE 스트리밍 메시지 전송

사용자가 Composer에 메시지를 입력하고 전송하면 BFF를 통해 백엔드 SSE 스트림을 수신해 AI 응답을 점진 표시한다.

#### Scenario: 메시지 전송 및 스트리밍 시작

- **Given** 로그인된 사용자가 `/chat?session={session_id}`에 있고 Composer에 텍스트가 입력되어 있다
- **When** 전송 버튼을 클릭하거나 Enter를 입력한다
- **Then** 사용자 메시지가 MessageList에 즉시 표시된다
- **And** `POST /api/chats/{session_id}/messages`가 `content: 입력 텍스트`와 함께 호출된다
- **And** `isStreaming`이 true로 설정되어 Composer 입력이 비활성화된다
- **And** AI 응답 말풍선이 빈 상태로 MessageList에 추가된다

#### Scenario: token 이벤트 수신 - 텍스트 누적 표시

- **Given** SSE 스트림이 시작된 상태다
- **When** 백엔드에서 `event: token\ndata: {"text":"안"}` 형태의 이벤트가 도착한다
- **Then** `streamingText`에 해당 텍스트 청크가 누적된다
- **And** AI 응답 말풍선에 누적된 텍스트가 실시간으로 표시된다

#### Scenario: sources 이벤트 수신 - 출처 표시

- **Given** SSE 스트림에서 token 이벤트 이후 sources 이벤트가 도착한다
- **When** `event: sources\ndata: [{"file_id":"...","filename":"doc.pdf","page":3}]` 이벤트가 수신된다
- **Then** Zustand 스토어의 `sources`가 갱신된다
- **And** AI 응답 말풍선 하단에 파일명과 페이지 번호가 포함된 출처 칩이 표시된다

#### Scenario: done 이벤트 수신 - 스트림 종료

- **Given** SSE 스트림이 진행 중이다
- **When** `event: done` 이벤트가 수신된다
- **Then** `isStreaming`이 false로 설정된다
- **And** Composer 입력이 다시 활성화된다
- **And** `useSessionQuery` 캐시가 무효화되어 최종 메시지 목록이 서버와 동기화된다
- **And** `streamingText`가 초기화된다

#### Scenario: 참고 문서가 없는 응답

- **Given** SSE 스트림에서 sources 이벤트가 도착하지 않는다
- **When** done 이벤트가 수신되어 스트림이 종료된다
- **Then** AI 응답 말풍선에 출처 칩 영역이 표시되지 않는다

---

### Requirement: 빈 입력 전송 차단

Composer에 아무 텍스트도 없는 상태에서 전송이 불가능하다.

#### Scenario: 빈 입력 전송 시도

- **Given** Composer 입력 필드가 비어있거나 공백만 있다
- **When** 전송 버튼을 클릭하거나 Enter를 입력한다
- **Then** `POST /api/chats/{session_id}/messages`가 호출되지 않는다
- **And** 스트리밍이 시작되지 않는다

---

### Requirement: 스트리밍 오류 처리

SSE 스트림 중 error 이벤트나 네트워크 단절이 발생하면 사용자에게 안내한다.

#### Scenario: error 이벤트 수신

- **Given** SSE 스트림이 진행 중이다
- **When** `event: error` 이벤트가 수신된다
- **Then** `isStreaming`이 false로 설정된다
- **And** Composer 입력이 다시 활성화된다
- **And** 진행 중이던 AI 응답 말풍선이 제거되거나 오류 상태로 표시된다
- **And** 사용자에게 "응답 중 오류가 발생했습니다" 등 이해 가능한 메시지가 안내된다

#### Scenario: 네트워크 단절로 fetch 실패

- **Given** 사용자가 메시지를 전송했다
- **When** fetch 호출 자체가 실패(네트워크 오류)한다
- **Then** `isStreaming`이 false로 설정된다
- **And** 오류 안내 메시지가 표시된다
- **And** Composer가 다시 사용 가능 상태가 된다

#### Scenario: 스트리밍 중 세션 이탈

- **Given** SSE 스트림이 진행 중이다
- **When** 사용자가 다른 세션으로 이동하거나 페이지를 벗어난다
- **Then** `AbortController.abort()`가 호출되어 fetch가 취소된다
- **And** Zustand 스토어가 초기화(`reset`)된다
- **And** 새 세션 뷰에 이전 스트리밍 데이터가 표시되지 않는다

---

### Requirement: 스트리밍 중 입력 비활성화

AI가 응답 중일 때 사용자가 새 메시지를 전송할 수 없다.

#### Scenario: isStreaming true 상태에서 전송 시도

- **Given** `isStreaming`이 true인 상태다
- **When** Composer에 텍스트를 입력하고 전송을 시도한다
- **Then** 전송 버튼이 비활성화(disabled) 상태다
- **And** `POST /api/chats/{session_id}/messages`가 호출되지 않는다

## MODIFIED Requirements

### Requirement: chat-page 목업 AI 응답 제거 (MODIFIED — chat-page capability)

기존 700ms 딜레이 목업 AI 응답을 제거하고 실제 SSE 스트리밍으로 교체한다.

#### Scenario: 목업 응답 코드 제거

- **Given** `src/app/(app)/chat/page.tsx`에 setTimeout 기반 목업 응답 로직이 존재한다
- **When** 변경이 적용된다
- **Then** setTimeout 목업 코드가 제거된다
- **And** `src/features/chat/mock-data.ts`의 시드 메시지가 더 이상 사용되지 않는다
- **And** AI 응답이 실제 `useStreamMessage` 훅을 통해 수신된다
