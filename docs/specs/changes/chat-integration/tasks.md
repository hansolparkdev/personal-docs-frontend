## 1. BFF SSE pass-through

- [x] 1.1 BFF route.ts에서 upstream 응답의 Content-Type이 `text/event-stream`인 경우 `response.body`를 버퍼링 없이 그대로 클라이언트로 중계하는 분기 추가
  - 수정 파일: `src/app/api/[...proxy]/route.ts`

## 2. 챗 타입 정의

- [x] 2.1 ChatSession, ChatMessage, SSEEvent(token/sources/done/error), Source 타입 정의
  - 수정 파일: `src/features/chat/types.ts`

## 3. 챗 API 함수

- [x] 3.1 세션 생성(`createSession`), 목록 조회(`listSessions`), 단일 조회(`getSession`), 삭제(`deleteSession`) 구현 — `lib/api.ts` 클라이언트 fetcher 사용
  - 수정 파일: `src/features/chat/api.ts`
- [x] 3.2 메시지 전송(`sendMessage`) 구현 — `fetch` 직접 호출, `ReadableStream` 반환, BFF `/api/chats/{session_id}/messages` 경로 사용
  - 수정 파일: `src/features/chat/api.ts`

## 4. 챗 Query 훅

- [x] 4.1 `useSessionsQuery` (GET /chats 목록), `useSessionQuery` (GET /chats/{id} 메시지 포함) 구현
  - 수정 파일: `src/features/chat/queries.ts`
- [x] 4.2 `useCreateSessionMutation` (POST /chats), `useDeleteSessionMutation` (DELETE /chats/{id}) 구현 — 성공 시 sessions 쿼리 캐시 무효화
  - 수정 파일: `src/features/chat/queries.ts`

## 5. Zustand 스트리밍 스토어

- [x] 5.1 `streamingText`, `sources`, `isStreaming` 상태와 `appendToken`, `setSources`, `setStreaming`, `reset` 액션 구현
  - 수정 파일: `src/features/chat/store.ts`

## 6. SSE 스트리밍 훅

- [x] 6.1 `useStreamMessage(sessionId)` 훅 구현 — `sendMessage` 호출 후 `TextDecoderStream`으로 SSE 라인 파싱, token/sources/done/error 이벤트 처리, `AbortController`로 언마운트 시 취소
  - 수정 파일: `src/features/chat/hooks/useStreamMessage.ts`

## 7. Sidebar 세션 목록 연동

- [x] 7.1 Sidebar에서 `useSessionsQuery`로 최근 대화 표시, 세션 클릭 시 `/chat?session={id}` 이동, "새 챗 시작" 클릭 시 `useCreateSessionMutation` 호출 후 이동, title이 null인 세션은 "새 대화" fallback 표시
  - 수정 파일: `src/components/layout/Sidebar.tsx`
- [x] 7.2 `(app)/layout.tsx`에서 `MOCK_RECENT_CHATS` 상수 및 관련 prop 제거, Sidebar가 자체적으로 세션 쿼리를 담당하도록 위임
  - 수정 파일: `src/app/(app)/layout.tsx`

## 8. 챗 페이지 실제 연동

- [x] 8.1 `chat/page.tsx`를 `searchParams.session` 기반으로 리팩터 — session 없으면 새 세션 생성 흐름 안내, session 있으면 `useSessionQuery`로 메시지 히스토리 로드
  - 수정 파일: `src/app/(app)/chat/page.tsx`
- [x] 8.2 `MessageList`에서 `useSessionQuery` 메시지 목록 표시 및 `isStreaming` 시 타이핑 인디케이터(AI 응답 말풍선 하단) 표시, `streamingText`를 마지막 AI 메시지 말풍선으로 점진 렌더링, `sources` 도착 시 응답 하단 출처 칩 표시
  - 수정 파일: `src/features/chat/components/MessageList.tsx`
- [x] 8.3 Composer 전송 액션에서 `useStreamMessage` 훅의 `send` 함수 호출, `isStreaming` 동안 입력 비활성화, 빈 입력 전송 차단
  - 수정 파일: `src/features/chat/components/Composer.tsx`, `src/features/chat/components/ComposerWithRef.tsx`

## 9. 목업 제거

- [x] 9.1 `mock-data.ts` 시드 메시지 배열 제거 (파일 삭제 또는 빈 export로 대체)
  - 수정 파일: `src/features/chat/mock-data.ts`
