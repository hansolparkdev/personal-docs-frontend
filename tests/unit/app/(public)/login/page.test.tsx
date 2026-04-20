import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockRedirect = vi.fn();

let _mockCookieValue: string | undefined = undefined;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/login",
  redirect: (...args: unknown[]) => mockRedirect(...args),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: (name: string) => {
        if (name === "access_token" && _mockCookieValue) {
          return { value: _mockCookieValue };
        }
        return undefined;
      },
    })
  ),
}));

vi.mock("@/features/auth/components/LoginCard", () => ({
  LoginCard: () => <div data-testid="login-card">LoginCard</div>,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _mockCookieValue = undefined;
  });

  it("LoginCard가 렌더링된다", async () => {
    _mockCookieValue = undefined;
    const { default: LoginPage } = await import("@/app/(public)/login/page");
    const element = await LoginPage();
    render(element as React.ReactElement);
    expect(screen.getByTestId("login-card")).toBeInTheDocument();
  });

  it("access_token 쿠키가 있으면 /docs로 redirect한다", async () => {
    _mockCookieValue = "valid_token";
    const { default: LoginPage } = await import("@/app/(public)/login/page");
    try {
      await LoginPage();
    } catch {
      // redirect throws in tests
    }
    expect(mockRedirect).toHaveBeenCalledWith("/docs");
  });
});
