# 스택 특화 규율

> 범용 워크플로우 규율은 `dev-workflow.md`. 이 파일은 스택별 추가 규율.

## Next.js App Router

개발 에이전트 착수 전 필수:
- `src/app/` 구조 확인 (라우트 그룹 파악)
- `src/lib/api.ts` / `src/lib/api-server.ts` 시그니처 확인

완료 체크리스트:
- [ ] `app/**/page.tsx` / `app/**/layout.tsx` 전부 테스트 존재
- [ ] `CI=1`, `--headless`, `process.env.CI=true` 미사용
- [ ] Server Component에서 `lib/api.ts` 호출 없음 → `lib/api-server.ts` 사용
- [ ] `app/` 하위 라우팅 파일 외 코드 없음
- [ ] 백엔드 URL 서버 환경변수만 사용 (`NEXT_PUBLIC_*` 금지)

## BFF (Route Handlers)

- Route Handler는 `app/api/[...proxy]/route.ts`에서 처리
- 브라우저에서 백엔드 직접 호출 금지 — 반드시 BFF 경유
- BFF에서 인증 토큰 주입 (쿠키 → Authorization 헤더 변환)
- 에러 응답은 백엔드 status 그대로 전파 (임의 변환 금지)

## React (TanStack Query)

- 문자열 리터럴 Query Key 금지 → `src/lib/query-keys/` Query Key Factory
- `setState+await` 낙관적 업데이트 금지 → `queryClient.setQueryData`
- fetch-on-render(`useEffect` fetch) 금지 → Server prefetch + HydrationBoundary

## Vitest + React Testing Library

- Server Component는 `@testing-library/react`의 `renderToString` 또는 통합 테스트
- BFF Route Handler 단위 테스트: `Request` 객체 직접 생성해서 핸들러 호출
- MSW(`msw/node`)로 외부 백엔드 API mocking — 실서버 호출 금지

## Playwright (E2E)

- 테스트 파일: `e2e/**/*.spec.ts`
- 로컬 실행: `pnpm e2e --headed` (CI=1 로컬 금지)
- 외부 실서버 호출 금지 → `playwright.config.ts`에 MSW 또는 fixture mock 설정

## shadcn/ui + Tailwind (Stitch 토큰)

- `tailwind.config.ts`의 `theme.extend`에 Stitch 토큰 색상·타이포·간격 반영
- shadcn 컴포넌트 추가: `pnpm dlx shadcn@latest add <component>`
- 추가 후 Stitch 토큰 변수명으로 className 교체
- `src/components/ui/` 외부에서 shadcn 원본 직접 import 금지 → 래핑 컴포넌트 사용
