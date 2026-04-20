# 전체 명령

## 개발·품질

| 명령 | 의미 |
|------|------|
| `pnpm install` | 의존 설치 |
| `pnpm dev` | 개발 서버 (localhost:3000) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | tsc --noEmit |
| `pnpm test` | 단위 테스트 (Vitest) |
| `pnpm test --watch` | 감시 모드 |
| `pnpm test:coverage` | 커버리지 리포트 |
| `pnpm e2e --headed` | E2E 로컬 (headed) |
| `pnpm e2e` | E2E CI 모드 |
| `pnpm format` | prettier --write |
| `pnpm audit` | 보안 스캔 |

## shadcn/ui 컴포넌트 추가

```bash
pnpm dlx shadcn@latest add <component>
```

> 추가된 컴포넌트는 `src/components/ui/`에 위치. Stitch 토큰 기반으로 커스터마이징.
