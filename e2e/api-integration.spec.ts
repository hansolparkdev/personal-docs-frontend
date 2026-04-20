import { test, expect } from "@playwright/test";

// ────────────────────────────────────────────────────────────────────────────
// session-guard
// 쿠키 없을 때 보호된 라우트 → /login 리다이렉트
// ────────────────────────────────────────────────────────────────────────────

test.describe("session-guard", () => {
  test("쿠키 없이 /docs 접근 → /login 리다이렉트", async ({ page }) => {
    // 쿠키 초기화 후 /docs 접근
    await page.context().clearCookies();
    await page.goto("/docs");
    await expect(page).toHaveURL(/\/login/);
  });

  test("쿠키 없이 /chat 접근 → /login 리다이렉트", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/chat");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/login 페이지 폼 요소 렌더링 확인", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login");

    // 아이디 입력 필드 (type="text", id="username")
    await expect(page.locator("#username")).toBeVisible();
    // 비밀번호 입력 필드
    await expect(page.locator('input[type="password"]')).toBeVisible();
    // 로그인 버튼
    await expect(
      page.getByRole("button", { name: "로그인", exact: true })
    ).toBeVisible();
    // SSO 버튼
    await expect(
      page.getByRole("button", { name: "SSO로 로그인" })
    ).toBeVisible();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// auth-integration (skip — 백엔드 필요)
// ────────────────────────────────────────────────────────────────────────────

test.describe("auth-integration (백엔드 필요 — skip)", () => {
  test.skip("로그인 성공 → /docs 이동", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("user@example.com");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await expect(page).toHaveURL("/docs");
  });

  test.skip("로그인 실패 → 에러 메시지 표시", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("wrong@example.com");
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    // 에러 메시지 표시 확인
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test.skip("회원가입 성공 → /docs 이동", async ({ page }) => {
    // 회원가입 플로우는 백엔드 API 필요
    await page.goto("/login");
  });

  test.skip("SSO 버튼 → Keycloak redirect", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "SSO로 로그인" }).click();
    // Keycloak 도메인으로 이동 확인 — 백엔드 필요
    await expect(page).toHaveURL(/keycloak/);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// file-integration (skip — 백엔드 필요)
// ────────────────────────────────────────────────────────────────────────────

test.describe("file-integration (백엔드 필요 — skip)", () => {
  test.skip("파일 업로드 성공", async ({ page }) => {
    // 로그인 세션 + 백엔드 API 필요
    await page.goto("/docs");
  });

  test.skip("파일 목록 조회", async ({ page }) => {
    // 백엔드 API 필요
    await page.goto("/docs");
  });

  test.skip("파일 삭제", async ({ page }) => {
    // 백엔드 API 필요
    await page.goto("/docs");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 클라이언트 검증 — 파일 확장자·크기 검증
// 실제 드롭존 UI가 mock 세션 없이 접근 불가하여 skip 처리
// ────────────────────────────────────────────────────────────────────────────

test.describe("클라이언트 검증 (백엔드 필요 — skip)", () => {
  test.skip("지원 확장자 외 파일 드롭 → 에러 메시지", async ({ page }) => {
    // /docs 접근 자체가 로그인 세션 필요
    await page.goto("/docs");
    const dropzone = page.locator("[data-testid='dropzone']");
    await dropzone.dispatchEvent("drop", {
      dataTransfer: { files: [new File([""], "test.exe", { type: "application/octet-stream" })] },
    });
    await expect(page.getByText(/지원하지 않는 파일/)).toBeVisible();
  });

  test.skip("50MB 초과 파일 → 에러 메시지", async ({ page }) => {
    // /docs 접근 자체가 로그인 세션 필요
    await page.goto("/docs");
    const dropzone = page.locator("[data-testid='dropzone']");
    // 50MB + 1 byte 파일 시뮬레이션
    const largeContent = new Uint8Array(50 * 1024 * 1024 + 1);
    await dropzone.dispatchEvent("drop", {
      dataTransfer: { files: [new File([largeContent], "big.pdf", { type: "application/pdf" })] },
    });
    await expect(page.getByText(/파일 크기/)).toBeVisible();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 보안 검증 — localStorage / sessionStorage 토큰 노출
// ────────────────────────────────────────────────────────────────────────────

test.describe("보안 - Storage 토큰 노출 (login 페이지 기준)", () => {
  // /login 은 쿠키 없이 접근 가능 → 토큰 없어야 함
  test("localStorage에 토큰 관련 키가 없음", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login");

    const tokenKeys = await page.evaluate(() => {
      const suspicious = ["token", "access", "refresh", "auth", "jwt", "session"];
      return Object.keys(localStorage).filter((k) =>
        suspicious.some((s) => k.toLowerCase().includes(s))
      );
    });

    expect(tokenKeys).toHaveLength(0);
  });

  test("sessionStorage에 토큰 관련 키가 없음", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login");

    const tokenKeys = await page.evaluate(() => {
      const suspicious = ["token", "access", "refresh", "auth", "jwt", "session"];
      return Object.keys(sessionStorage).filter((k) =>
        suspicious.some((s) => k.toLowerCase().includes(s))
      );
    });

    expect(tokenKeys).toHaveLength(0);
  });
});
