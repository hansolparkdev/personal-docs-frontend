import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "@/features/chat/components/MessageBubble";
import type { Message } from "@/features/chat/types";

describe("MessageBubble", () => {
  it("user role → 우측 정렬 버블을 렌더링한다", () => {
    const message: Message = { id: "1", role: "user", text: "안녕하세요" };
    const { container } = render(<MessageBubble message={message} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("justify-end");
  });

  it("ai role → 좌측 정렬 버블을 렌더링한다", () => {
    const message: Message = { id: "2", role: "ai", text: "안녕하세요!" };
    const { container } = render(<MessageBubble message={message} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("justify-start");
  });

  it("ai role + sources → CitationChip을 렌더링한다", () => {
    const message: Message = {
      id: "3",
      role: "ai",
      text: "참고 문서입니다",
      sources: [{ doc: "문서A", loc: "p.1" }],
    };
    render(<MessageBubble message={message} />);
    expect(screen.getByText("문서A · p.1")).toBeInTheDocument();
  });

  it("ai role + sources 없음 → CitationChip을 렌더링하지 않는다", () => {
    const message: Message = {
      id: "4",
      role: "ai",
      text: "출처 없는 답변",
    };
    render(<MessageBubble message={message} />);
    // 출처 칩이 없으면 'p.' 패턴 텍스트가 없어야 함
    expect(screen.queryByText(/·\sp\./)).not.toBeInTheDocument();
  });
});
