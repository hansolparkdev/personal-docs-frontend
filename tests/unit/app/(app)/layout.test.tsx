import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/docs",
  redirect: vi.fn(),
}));

vi.mock("@/components/layout/Sidebar", () => ({
  Sidebar: () => <aside data-testid="sidebar">Sidebar</aside>,
}));

describe("AppLayout", () => {
  it("Sidebar가 렌더링된다", async () => {
    const { default: AppLayout } = await import("@/app/(app)/layout");
    render(<AppLayout>children</AppLayout>);
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("children이 렌더링된다", async () => {
    const { default: AppLayout } = await import("@/app/(app)/layout");
    render(<AppLayout><div data-testid="child-content">child</div></AppLayout>);
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });
});
