import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/docs",
  redirect: vi.fn(),
}));

vi.mock("@/features/docs/components/Dropzone", () => ({
  Dropzone: () => <div data-testid="dropzone">Dropzone</div>,
}));

vi.mock("@/features/docs/components/DocList", () => ({
  DocList: () => <div data-testid="doc-list">DocList</div>,
}));

vi.mock("@/features/docs/mock-data", () => ({
  MOCK_DOCS: [],
}));

describe("DocsPage", () => {
  it("'내 문서' 헤더를 렌더링한다", async () => {
    const { default: DocsPage } = await import("@/app/(app)/docs/page");
    render(<DocsPage />);
    expect(screen.getByText("내 문서")).toBeInTheDocument();
  });

  it("Dropzone을 렌더링한다", async () => {
    const { default: DocsPage } = await import("@/app/(app)/docs/page");
    render(<DocsPage />);
    expect(screen.getByTestId("dropzone")).toBeInTheDocument();
  });

  it("DocList를 렌더링한다", async () => {
    const { default: DocsPage } = await import("@/app/(app)/docs/page");
    render(<DocsPage />);
    expect(screen.getByTestId("doc-list")).toBeInTheDocument();
  });
});
