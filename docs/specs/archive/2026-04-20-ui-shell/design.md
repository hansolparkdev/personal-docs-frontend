# Design: ui-shell

## Context

Next.js 15 App Router 기반 프로젝트에 라우팅 그룹 `(app)` / `(public)` 이 이미 정의되어 있으나, 실제 page.tsx 파일은 존재하지 않는다. Tailwind CSS v4 + shadcn/ui (base-nova, neutral) 가 세팅되어 있고, globals.css 에 CSS 변수 공간이 있으나 시맨틱 토큰(fg-*, bg-*)은 아직 없다. 목업 데이터만 사용하므로 TanStack Query / Zustand 는 이번 스코프에서 최소 사용한다.

## Goals / Non-Goals

**Goals:**
- 3개 화면(로그인·문서·챗)이 목업 데이터로 렌더링되고 사이드바로 이동 가능
- oklch 중립 팔레트 시맨틱 변수가 globals.css 에 선언되어 컴포넌트에서 `var(--fg-primary)` 형태로 참조 가능
- 금지 패턴 위반 없음 (middleware.ts 미사용, app/ 내 로직 없음, default export는 page/layout 만)

**Non-Goals:**
- 실제 API 호출, 인증 세션, 파일 업로드 처리
- 모바일 반응형 세밀 대응
- 에러/로딩의 모든 변형 처리

## Decisions

### 1. 시맨틱 토큰 체계 — CSS 변수 네이밍

**결정**: `--fg-primary`, `--fg-secondary`, `--fg-muted`, `--bg-surface`, `--bg-subtle`, `--bg-accent`, `--border-default`, `--border-strong`, `--accent-primary` 를 oklch 중립 팔레트 기반으로 globals.css 에 선언한다. 다크 모드는 `.dark` 셀렉터 블록으로 오버라이드한다.

**이유**: Tailwind v4 는 CSS 변수를 직접 `@theme` 에 등록하면 `text-[var(--fg-primary)]` 없이 `text-fg-primary` 유틸리티로 쓸 수 있다. 컴포넌트가 하드코딩된 neutral-* 숫자 클래스에 의존하지 않고 의미 기반 토큰을 참조해야 디자인 시스템 교체 비용이 낮아진다.

---

### 2. Sidebar 폭 및 레이아웃 구조

**결정**: Sidebar 는 `w-[260px] shrink-0` 고정 폭, 나머지 콘텐츠 영역은 `flex-1 min-w-0 overflow-auto`. 전체 `(app)` layout 은 `flex h-screen` 루트 div 로 감싼다.

**이유**: 260px 는 plan.md 의 디자인 레퍼런스 수치이며, CSS grid 대신 flex 를 쓰는 이유는 Sidebar 가 고정이고 나머지 영역만 스크롤되는 구조에서 flex + overflow-auto 가 더 단순하기 때문이다.

---

### 3. 인증 가드 구현 방식 — middleware.ts 금지 대응

**결정**: `middleware.ts` 는 금지 패턴이므로 사용하지 않는다. 대신 `(app)/layout.tsx` 에서 `cookies()` (server-side) 또는 간단한 목업 플래그를 읽어 인증되지 않은 경우 `redirect('/login')` 을 호출한다. 이번 스코프에서는 항상 인증된 것으로 간주하는 목업 가드로 구현한다.

**이유**: Next.js 16에서 `middleware.ts`가 `proxy.ts`로 대체됐다(deprecated). 이 프로젝트는 Next.js 16을 사용하므로 `middleware.ts` 작성은 금지 패턴이며, 인증 가드는 `(app)/layout.tsx` Server Component의 `redirect()`로 구현한다.

---

### 4. 로그인 실패 안내 — Open Question 결론

**결정**: 이번 스코프는 목업이므로 로그인은 항상 성공한다. 에러 상태 UI(인라인 에러 메시지)는 컴포넌트 prop 으로 인터페이스만 정의하고 빈 문자열로 초기화한다. 실제 에러 문구는 API 연동 스펙에서 결정한다.

**이유**: Non-goal 에 "에러 상태의 모든 변형" 이 명시되어 있으며, UI 껍데기만 있어도 이후 구현자가 에러 prop 을 채우면 된다.

---

### 5. 문서 상태 종류 — Open Question 결론

**결정**: 목업 데이터에서 사용할 상태는 `ready` | `indexing` 두 가지로 한정한다. 배지 색상: ready → secondary(중립 채운 배경), indexing → outline(테두리만, 점 펄스 애니메이션). 추후 `error` | `queued` 상태는 API 연동 스펙에서 추가한다.

**이유**: plan.md Goals "인덱싱 완료 / 처리 중" 두 상태가 명시됨. 스코프를 최소로 유지하면서 컴포넌트 확장성은 union type 으로 보장한다.

---

### 6. 챗 출처 인용 형식 — Open Question 결론

**결정**: 출처 인용은 AI 버블 하단에 `칩` 형태로 표시한다. 칩은 `[문서명 · p.N]` 텍스트를 포함한 rounded-full border 요소. 툴팁은 이번 스코프 미포함.

**이유**: 번호 표기는 메시지 내 인라인 마킹이 필요해 복잡도가 높다. 칩은 shadcn/ui Badge 컴포넌트로 간단히 구현 가능하고, 디자인 시스템의 테두리 중심 미학과 일치한다.

---

### 7. 최근 대화 목록 — Open Question 결론

**결정**: Sidebar 에 최근 대화 목록을 최대 5개까지 표시한다. 목업 데이터로 3개 하드코딩. 빈 상태 문구: "아직 대화 기록이 없어요".

**이유**: 5개는 260px 사이드바에서 스크롤 없이 표시 가능한 적정 수. 빈 상태는 forbidden-patterns 의 "빈 상태 미처리 금지" 규칙 준수.

---

### 8. 컴포넌트 배치 — features vs components/layout

**결정**:
- `Sidebar`, `WordMark` → `src/components/layout/` (도메인 비종속 공통 레이아웃)
- `LoginCard` → `src/features/auth/components/`
- `Dropzone`, `DocList`, `DocRow` → `src/features/docs/components/`
- `MessageList`, `MessageBubble`, `Composer`, `CitationChip` → `src/features/chat/components/`

**이유**: folder-conventions.md 규칙 — Sidebar/WordMark 는 도메인 비종속이므로 components/layout/. 나머지는 각 도메인 슬라이스 내부에서만 사용되므로 features/ 하위.

---

### 9. 디자인 토큰 수치 확정

| 요소 | 값 |
|------|----|
| 사이드바 폭 | 260px |
| 버튼 border-radius | rounded-lg (8px) |
| 카드 border-radius | rounded-xl (14px) |
| 카드 그림자 | 없음 (shadow-none) |
| 팝오버 그림자 | shadow-sm |
| 폰트 패밀리 | Geist Sans (sans), Geist Mono (mono) |
| 배경 (전체) | var(--bg-subtle) → oklch(97% 0 0) ≈ neutral-50 |
| 배경 (카드/사이드바) | var(--bg-surface) → oklch(100% 0 0) = white |
| 테두리 | var(--border-default) → oklch(90% 0 0) ≈ neutral-200 |
| 액센트 | var(--accent-primary) → oklch(55% 0.15 250) ≈ blue-600 계열 |

## Risks / Trade-offs

- **목업 인증 가드 잔류**: 목업 가드가 실제 인증 없이 (app) 라우트를 허용하므로, API 연동 전 실수로 배포 시 인증 없이 내부 화면이 노출될 수 있다. → 완화책: 가드 코드에 `// TODO: replace with real session check` 주석 필수.
- **하드코딩 목업 데이터**: features/ 슬라이스에 mock 배열이 직접 정의됨. API 연동 시 모두 교체 필요. → 완화책: 목업 데이터를 `features/<domain>/mock-data.ts` 파일로 분리해 교체 범위를 명확히 한다.
- **시맨틱 토큰 미완성**: oklch 값이 실제 디자인 가이드 파일과 정확히 일치하지 않을 수 있다. → 완화책: design-ref 파일을 개발 중 직접 참조해 수치를 교정한다.
