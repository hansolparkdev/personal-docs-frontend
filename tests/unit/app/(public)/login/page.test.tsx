import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/login",
  redirect: vi.fn(),
}));

vi.mock("@/features/auth/components/LoginCard", () => ({
  LoginCard: () => <div data-testid="login-card">LoginCard</div>,
}));

describe("LoginPage", () => {
  it("LoginCard가 렌더링된다", async () => {
    const { default: LoginPage } = await import(
      "@/app/(public)/login/page"
    );
    render(<LoginPage />);
    expect(screen.getByTestId("login-card")).toBeInTheDocument();
  });
});
