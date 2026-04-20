import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CitationChip } from "@/features/chat/components/CitationChip";
import type { CitationSource } from "@/features/chat/types";

describe("CitationChip", () => {
  const source: CitationSource = { doc: "문서명", loc: "p.5" };

  it("'[문서명 · p.N]' 형태로 렌더링된다", () => {
    render(<CitationChip source={source} />);
    expect(screen.getByText("문서명 · p.5")).toBeInTheDocument();
  });

  it("outline 스타일 Badge로 렌더링된다", () => {
    const { container } = render(<CitationChip source={source} />);
    // Badge variant="outline" 이 적용된 요소 확인 — rounded-full 클래스로 식별
    const badge = container.querySelector(".rounded-full");
    expect(badge).toBeInTheDocument();
  });
});
