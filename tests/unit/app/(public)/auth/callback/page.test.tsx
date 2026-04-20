import { describe, it, expect, vi } from "vitest";

const mockRedirect = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

vi.mock("@/lib/api-server", () => ({
  apiServer: {
    get: vi.fn(),
  },
}));

describe("SSO Callback Page", () => {
  it("code가 없으면 /login?error=sso로 redirect한다", async () => {
    const { default: CallbackPage } = await import(
      "@/app/(public)/auth/callback/page"
    );
    // searchParams에 code 없음
    await CallbackPage({ searchParams: Promise.resolve({}) });
    expect(mockRedirect).toHaveBeenCalledWith("/login?error=sso");
  });

  it("code로 토큰 교환 성공 시 /docs로 redirect한다", async () => {
    const { apiServer } = await import("@/lib/api-server");
    vi.mocked(apiServer.get).mockResolvedValue({
      access_token: "tok",
      refresh_token: "ref",
      token_type: "bearer",
      expires_in: 3600,
    });

    vi.resetModules();
    vi.mock("next/navigation", () => ({ redirect: mockRedirect }));
    vi.mock("@/lib/api-server", () => ({
      apiServer: {
        get: vi.fn().mockResolvedValue({
          access_token: "tok",
          refresh_token: "ref",
          token_type: "bearer",
          expires_in: 3600,
        }),
      },
    }));

    const { default: CallbackPage } = await import(
      "@/app/(public)/auth/callback/page"
    );
    await CallbackPage({
      searchParams: Promise.resolve({ code: "auth_code_123" }),
    });
    expect(mockRedirect).toHaveBeenCalledWith("/docs");
  });

  it("토큰 교환 실패 시 /login?error=sso로 redirect한다", async () => {
    vi.resetModules();
    vi.mock("next/navigation", () => ({ redirect: mockRedirect }));
    vi.mock("@/lib/api-server", () => ({
      apiServer: {
        get: vi.fn().mockRejectedValue(new Error("exchange failed")),
      },
    }));

    const { default: CallbackPage } = await import(
      "@/app/(public)/auth/callback/page"
    );
    await CallbackPage({
      searchParams: Promise.resolve({ code: "bad_code" }),
    });
    expect(mockRedirect).toHaveBeenCalledWith("/login?error=sso");
  });
});
