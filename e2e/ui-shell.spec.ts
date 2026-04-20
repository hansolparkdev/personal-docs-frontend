import { test, expect } from "@playwright/test";

// ────────────────────────────────────────────────────────────────────────────
// shared-layout
// ────────────────────────────────────────────────────────────────────────────

test.describe("shared-layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs");
  });

  test("사이드바 기본 요소 렌더링: WordMark, 새 챗 시작, 내 문서, 챗, 최근 대화, 유저 푸터", async ({
    page,
  }) => {
    // WordMark
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();

    // 새 챗 시작 버튼
    await expect(page.getByRole("button", { name: "새 챗 시작" })).toBeVisible();

    // 내 문서, 챗 메뉴
    await expect(page.getByRole("button", { name: "내 문서" })).toBeVisible();
    await expect(page.getByRole("button", { name: "챗", exact: true })).toBeVisible();

    // 최근 대화 섹션 제목
    await expect(page.getByText("최근 대화")).toBeVisible();

    // 유저 푸터 - 로그아웃 버튼
    await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
  });

  test("/docs 경로에서 '내 문서' 메뉴가 활성 상태", async ({ page }) => {
    const docsButton = page.getByRole("button", { name: "내 문서" });
    await expect(docsButton).toHaveClass(/bg-accent/);
  });

  test("/chat 경로에서 '챗' 메뉴가 활성 상태", async ({ page }) => {
    await page.goto("/chat");
    const chatButton = page.getByRole("button", { name: "챗", exact: true });
    await expect(chatButton).toHaveClass(/bg-accent/);
  });

  test("'새 챗 시작' 클릭 → /chat으로 이동", async ({ page }) => {
    await page.getByRole("button", { name: "새 챗 시작" }).click();
    await expect(page).toHaveURL("/chat");
  });

  test("로그아웃 클릭 → /login으로 이동", async ({ page }) => {
    await page.getByRole("button", { name: "로그아웃" }).click();
    await expect(page).toHaveURL("/login");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// login-page
// ────────────────────────────────────────────────────────────────────────────

test.describe("login-page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("이메일·비밀번호 입력 필드, 로그인 버튼, SSO 버튼 렌더링", async ({
    page,
  }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인", exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "SSO로 로그인" })
    ).toBeVisible();
  });

  test("이메일·비밀번호 입력 후 로그인 버튼 클릭 → /docs 이동", async ({
    page,
  }) => {
    await page.locator('input[type="email"]').fill("test@example.com");
    await page.locator('input[type="password"]').fill("password123");
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await expect(page).toHaveURL("/docs");
  });

  test("SSO 버튼 클릭 → /docs 이동", async ({ page }) => {
    await page.getByRole("button", { name: "SSO로 로그인" }).click();
    await expect(page).toHaveURL("/docs");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// doc-upload-page
// ────────────────────────────────────────────────────────────────────────────

test.describe("doc-upload-page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs");
  });

  test("문서 목록 4개 렌더링 + '인덱싱 완료'·'처리 중' 배지 표시", async ({
    page,
  }) => {
    // 4개 문서명 확인
    await expect(page.getByText("프로젝트 기획서.pdf")).toBeVisible();
    await expect(page.getByText("API 설계 문서.pdf")).toBeVisible();
    await expect(page.getByText("회의록 2026-04.pdf")).toBeVisible();
    await expect(page.getByText("기술 스펙 v2.pdf")).toBeVisible();

    // 인덱싱 완료 배지 (ready: 2개)
    const readyBadges = page.getByText("인덱싱 완료");
    await expect(readyBadges).toHaveCount(2);

    // 처리 중 배지 (indexing: 2개)
    const indexingBadges = page.getByText("처리 중");
    await expect(indexingBadges).toHaveCount(2);
  });

  test("삭제 버튼 클릭 → 해당 항목 제거", async ({ page }) => {
    // "프로젝트 기획서.pdf" 삭제
    await page.getByRole("button", { name: "프로젝트 기획서.pdf 삭제" }).click();
    await expect(page.getByText("프로젝트 기획서.pdf")).not.toBeVisible();

    // 나머지 3개 남아있음
    await expect(page.getByText("API 설계 문서.pdf")).toBeVisible();
    await expect(page.getByText("회의록 2026-04.pdf")).toBeVisible();
    await expect(page.getByText("기술 스펙 v2.pdf")).toBeVisible();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// chat-page
// ────────────────────────────────────────────────────────────────────────────

test.describe("chat-page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/chat");
  });

  test("시드 대화 렌더링: user 버블, AI 버블, 출처 칩", async ({ page }) => {
    // user 버블
    await expect(
      page.getByText("프로젝트 기획서의 핵심 목표가 무엇인가요?")
    ).toBeVisible();

    // AI 버블
    await expect(page.getByText(/핵심 목표는 개인 문서를 AI 기반으로/)).toBeVisible();

    // 출처 칩 (CitationChip: "{doc} · {loc}" 형식)
    await expect(page.getByText("프로젝트 기획서 · p.3")).toBeVisible();
    await expect(page.getByText("API 설계 문서 · p.1")).toBeVisible();
  });

  test("메시지 입력 후 전송 → user 버블 추가", async ({ page }) => {
    const textarea = page.getByLabel("메시지 입력");
    await textarea.fill("테스트 질문입니다");
    await page.getByRole("button", { name: "전송" }).click();

    // 전송된 메시지가 버블로 나타남
    await expect(page.getByText("테스트 질문입니다")).toBeVisible();
  });

  test("빈 입력일 때 전송 버튼 disabled", async ({ page }) => {
    const sendButton = page.getByRole("button", { name: "전송" });
    await expect(sendButton).toBeDisabled();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// 보안 검증 — 클라이언트 Storage 토큰 노출 여부
// ────────────────────────────────────────────────────────────────────────────

test.describe("보안 - 토큰 Storage 노출", () => {
  test("localStorage에 토큰 관련 키가 없음", async ({ page }) => {
    await page.goto("/docs");

    const tokenKeys = await page.evaluate(() => {
      const suspicious = ["token", "access", "refresh", "auth", "jwt", "session"];
      return Object.keys(localStorage).filter((k) =>
        suspicious.some((s) => k.toLowerCase().includes(s))
      );
    });

    expect(tokenKeys).toHaveLength(0);
  });

  test("sessionStorage에 토큰 관련 키가 없음", async ({ page }) => {
    await page.goto("/docs");

    const tokenKeys = await page.evaluate(() => {
      const suspicious = ["token", "access", "refresh", "auth", "jwt", "session"];
      return Object.keys(sessionStorage).filter((k) =>
        suspicious.some((s) => k.toLowerCase().includes(s))
      );
    });

    expect(tokenKeys).toHaveLength(0);
  });
});
