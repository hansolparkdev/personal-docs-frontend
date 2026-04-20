## Why

챗 화면이 하드코딩된 시드 메시지와 목업 AI 응답으로 동작해 사용자가 실제 대화를 저장·재방문할 수 없다. 인증과 파일 업로드 연동이 완료된 상태이므로, 챗 API를 연동해 개인 문서 기반 실제 대화가 동작하는 제품으로 전환한다.

## What Changes

- BFF Route Handler에서 SSE 경로에 대한 스트리밍 pass-through 처리 추가
- `features/chat/` 타입·API·쿼리·스토어·훅을 실제 백엔드 API 기반으로 구현
- Sidebar 최근 대화를 하드코딩 → 실제 세션 목록 쿼리로 교체
- `(app)/layout.tsx`의 `MOCK_RECENT_CHATS` 제거
- `chat/page.tsx`를 `session` URL 쿼리 파라미터 기반으로 리팩터
- `MessageList`, `Composer` 컴포넌트를 실제 SSE 스트리밍 연동
- `mock-data.ts` 시드 메시지 제거

## Capabilities

### New Capabilities

- `chat-session`: 세션 생성·목록 조회·단일 세션+메시지 조회·삭제. Sidebar "최근 대화"를 실제 세션 목록으로 대체하고, 세션 진입 시 메시지 히스토리 복원. 제목이 null인 세션은 첫 사용자 메시지 앞 20자로 표시.
- `chat-message`: 사용자 메시지를 현재 세션에 전송하고 `fetch + ReadableStream`으로 SSE 토큰을 순서대로 누적 표시. `sources` 이벤트로 출처(파일명·페이지) 표시, `done`에서 스트림 종료, `error`에서 오류 안내.

### Modified Capabilities

- `chat-page`: 목업 AI 응답(700ms 딜레이 하드코딩) → 실제 SSE 스트리밍으로 교체. `session` URL 쿼리 파라미터로 세션 식별.
- `shared-layout`: 하드코딩된 `MOCK_RECENT_CHATS` → 실제 세션 목록 쿼리(`useSessionsQuery`)로 교체.

## Impact

- `src/app/api/[...proxy]/route.ts` — SSE pass-through 분기 추가
- `src/features/chat/types.ts` — ChatSession, ChatMessage, SSEEvent 타입
- `src/features/chat/api.ts` — createSession, listSessions, getSession, deleteSession, sendMessage
- `src/features/chat/queries.ts` — useSessionsQuery, useSessionQuery, useCreateSessionMutation, useDeleteSessionMutation
- `src/features/chat/store.ts` — 스트리밍 상태 (streamingText, sources, isStreaming)
- `src/features/chat/hooks/useStreamMessage.ts` — fetch + ReadableStream SSE 훅
- `src/components/layout/Sidebar.tsx` — 세션 목록 실제 연동
- `src/app/(app)/layout.tsx` — MOCK_RECENT_CHATS 제거
- `src/app/(app)/chat/page.tsx` — session 쿼리 파라미터 기반 리팩터
- `src/features/chat/components/MessageList.tsx` — 실제 메시지·스트리밍 표시
- `src/features/chat/components/Composer.tsx` — useStreamMessage 연동
- `src/features/chat/components/ComposerWithRef.tsx` — useStreamMessage 연동
- `src/features/chat/mock-data.ts` — 시드 메시지 제거

## Meta

- feature: chat-integration
- type: frontend
- package: frontend
- design-ref: none

프리로드: folder-conventions.md · dev-flow.md · forbidden-patterns.md
