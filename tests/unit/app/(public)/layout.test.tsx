import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/login",
  redirect: vi.fn(),
}));

vi.mock("@/components/layout/Sidebar", () => ({
  Sidebar: () => <aside data-testid="sidebar">Sidebar</aside>,
}));

describe("PublicLayout", () => {
  it("children이 렌더링된다", async () => {
    const { default: PublicLayout } = await import("@/app/(public)/layout");
    render(<PublicLayout><div data-testid="child-content">child</div></PublicLayout>);
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("Sidebar가 없다", async () => {
    const { default: PublicLayout } = await import("@/app/(public)/layout");
    render(<PublicLayout>children</PublicLayout>);
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
  });
});
