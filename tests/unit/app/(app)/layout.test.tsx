import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

const mockRedirect = vi.fn();
const mockPush = vi.fn();

let _mockCookieValue: string | undefined = "test_token";
let _mockApiResult: unknown = { user_id: "1", username: "testuser", email: "a@b.com", name: "테스트" };
let _mockApiShouldThrow = false;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/docs",
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

vi.mock("@/lib/api-server", () => ({
  apiServer: {
    get: vi.fn(() => {
      if (_mockApiShouldThrow) {
        return Promise.reject(Object.assign(new Error("401"), { status: 401 }));
      }
      return Promise.resolve(_mockApiResult);
    }),
  },
}));

vi.mock("@/components/layout/Sidebar", () => ({
  Sidebar: () => <aside data-testid="sidebar">Sidebar</aside>,
}));

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _mockCookieValue = "test_token";
    _mockApiResult = { user_id: "1", username: "testuser", email: "a@b.com", name: "테스트" };
    _mockApiShouldThrow = false;
  });

  it("인증된 경우 Sidebar가 렌더링된다", async () => {
    const { default: AppLayout } = await import("@/app/(app)/layout");
    const element = await AppLayout({ children: <div data-testid="child">child</div> });
    render(element as React.ReactElement);
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("children이 렌더링된다", async () => {
    const { default: AppLayout } = await import("@/app/(app)/layout");
    const element = await AppLayout({ children: <div data-testid="child-content">child</div> });
    render(element as React.ReactElement);
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("access_token 쿠키가 없으면 /login으로 redirect한다", async () => {
    _mockCookieValue = undefined;
    const { default: AppLayout } = await import("@/app/(app)/layout");
    try {
      await AppLayout({ children: <div>child</div> });
    } catch {
      // redirect throws in tests
    }
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("/auth/me 실패 시 /login으로 redirect한다", async () => {
    _mockApiShouldThrow = true;
    const { default: AppLayout } = await import("@/app/(app)/layout");
    try {
      await AppLayout({ children: <div>child</div> });
    } catch {
      // redirect throws in tests
    }
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });
});
