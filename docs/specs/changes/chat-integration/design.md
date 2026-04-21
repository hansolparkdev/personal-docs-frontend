## Context

챗 화면(`src/app/(app)/chat/page.tsx`)은 하드코딩된 시드 메시지와 700ms 딜레이 목업으로 동작하며, Sidebar의 최근 대화도 `MOCK_RECENT_CHATS` 상수다. BFF(`src/app/api/[...proxy]/route.ts`)는 현재 `await fetch()`로 전체 응답을 버퍼링하므로 SSE 응답을 그대로 전달할 수 없다. 백엔드는 세션 CRUD와 SSE 메시지 전송 API를 제공하며, 인증 헤더는 BFF가 쿠키에서 주입한다.

## Goals / Non-Goals

**Goals:**
- 챗 세션 생성·목록·조회·삭제 실제 API 연동
- SSE 스트리밍 토큰을 브라우저에서 점진 표시 (`fetch + ReadableStream`)
- BFF가 SSE 응답을 버퍼링 없이 클라이언트로 pass-through
- Sidebar 최근 대화를 실제 세션 목록으로 교체
- 세션 진입 시 기존 메시지 히스토리 복원
- 응답 완료 후 출처(파일명·페이지) 칩 표시

**Non-Goals:**
- 세션 제목 수동 변경, 메시지 수정·삭제, 대화 공유·내보내기
- 응답 중단·재생성, 다중 모델 선택
- 출처 클릭 시 원본 문서 뷰어 이동
- 세션 제목 백엔드 자동 요약·재생성

## Decisions

### 1. SSE 수신 방식: fetch + ReadableStream

`EventSource`는 GET 전용이며 커스텀 헤더를 설정할 수 없다. 메시지 전송 엔드포인트는 POST이고 BFF가 Authorization 헤더를 주입해야 하므로 `EventSource` 사용이 불가능하다. `fetch`로 POST를 보내고 `response.body`(`ReadableStream`)를 `TextDecoderStream`으로 읽어 SSE 라인을 파싱한다.

**이유**: POST + 인증 헤더 요건을 충족하는 유일한 표준 브라우저 API이며, `forbidden-patterns.md`의 `useEffect` fetch-on-render 금지 패턴을 피하기 위해 이벤트 핸들러(Composer 전송 액션)에서 직접 호출하는 커스텀 훅으로 캡슐화한다.

### 2. BFF SSE pass-through

현재 BFF는 `await fetch()` 후 응답 본문을 JSON으로 파싱해 반환한다. SSE 경로(`POST /chats/{session_id}/messages`)는 `text/event-stream`을 반환하므로, Content-Type이 `text/event-stream`인 경우 upstream 응답의 `body`(`ReadableStream`)를 그대로 `new Response(upstream.body, ...)`로 중계한다. 버퍼링 없이 청크가 도착할 때마다 클라이언트로 전달된다.

**이유**: Next.js Node 런타임에서 `Response`에 `ReadableStream`을 직접 넣으면 스트리밍이 동작한다. Edge 런타임은 별도 설정 없이 동일하게 동작하나, 현재 BFF는 Node 런타임을 유지한다(쿠키 접근·헤더 주입 로직이 이미 Node API 의존).

### 3. 스트리밍 상태 관리: Zustand

스트리밍 중인 텍스트(`streamingText`), 수신된 출처(`sources`), 진행 여부(`isStreaming`)는 서버 상태가 아니라 일시적 UI 상태다. TanStack Query 캐시에 넣으면 완료 전 캐시 무효화 타이밍이 복잡해지고 낙관적 업데이트와 충돌 가능성이 있다. Zustand 스토어에서 관리하고, `done` 이벤트 수신 시 `useSessionQuery` 캐시를 무효화해 최종 메시지를 서버 상태로 동기화한다.

**이유**: `forbidden-patterns.md`의 `setState + await` 낙관적 업데이트 금지 규칙을 준수하면서 스트리밍 진행 상태를 컴포넌트 트리 전반에 공유하는 최소 복잡도 방법.

### 4. 세션 제목 표시 규칙

백엔드가 세션 제목을 자동 생성하지 않아 `title`이 null로 반환된다. Sidebar에서 null이면 해당 세션의 첫 사용자 메시지 내용 앞 20자 + "..." 형태로 대체 표시한다. 세션 목록 API(`GET /chats`)가 메시지를 포함하지 않으므로, title이 null인 세션은 단일 세션 조회(`GET /chats/{id}`) 없이 "새 대화"로 fallback 표시하고 세션 진입 시 메시지를 로드해 제목을 결정한다.

**이유**: 목록 조회마다 개별 세션을 N+1로 불러오는 것은 과도한 요청이며, 목록에서 "새 대화"로 표시해도 UX 저하가 없다고 판단.

### 5. 세션 선택 및 라우팅

Sidebar에서 세션 클릭 시 `router.push('/chat?session={id}')`, "새 챗 시작" 클릭 시 `POST /chats` 호출 후 반환된 `id`로 동일 경로 이동. `chat/page.tsx`는 `searchParams.session`을 읽어 세션 ID를 결정하고, 없으면 새 세션 생성 흐름으로 진입한다.

**이유**: URL에 세션 ID를 포함하면 새로고침·뒤로가기 시에도 세션 상태가 유지되며, 서버 컴포넌트에서 `searchParams`로 바로 읽을 수 있다.

### 6. 스트리밍 중 세션 이탈

사용자가 스트리밍 진행 중 다른 세션으로 이동하면 `useStreamMessage` 훅이 언마운트될 때 `AbortController.abort()`를 호출해 fetch를 취소한다. 부분 응답은 버리고 스토어를 초기화한다.

**이유**: 취소 없이 방치하면 구 세션의 토큰이 새 세션 뷰에 혼입될 수 있으며, 리소스 누수 방지.

### 7. 세션 삭제 UX

삭제는 낙관적 갱신 없이 API 호출 성공 후 `useSessionsQuery` 캐시를 무효화한다. `forbidden-patterns.md`의 `setState + await` 낙관적 업데이트 금지 규칙을 준수한다. 삭제 전 별도 확인 다이얼로그는 구현하지 않는다(범위 외 UX).

**이유**: 단순성 우선. 삭제 확인 UX는 Open Question으로 남기며 추후 별도 스펙으로 다룬다.

## Risks / Trade-offs

- **BFF Node 런타임 + ReadableStream pipe**: Next.js 15에서 검증된 패턴이나, 런타임 업그레이드 시 재검토 필요 → 통합 테스트로 SSE 스트리밍 동작 보장.
- **세션 목록 title null fallback "새 대화"**: 여러 미제목 세션이 동시에 존재하면 구분 불가 → 백엔드 제목 자동 생성 기능 추가 시 재스펙.
- **스트리밍 중 부분 응답 보존 안 함**: 취소 시 부분 텍스트 손실 → 현재 요건에서 복원 기능이 Non-Goal이므로 감수.
