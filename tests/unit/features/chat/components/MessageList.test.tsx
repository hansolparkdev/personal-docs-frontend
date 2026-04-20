import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MessageList } from "@/features/chat/components/MessageList";
import type { Message } from "@/features/chat/types";

const SEED_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    text: "프로젝트 기획서의 핵심 목표가 무엇인가요?",
  },
  {
    id: "2",
    role: "ai",
    text: "AI 응답 텍스트입니다.",
    sources: [
      { doc: "프로젝트 기획서", loc: "p.3" },
      { doc: "API 설계 문서", loc: "p.1" },
    ],
  },
];

describe("MessageList", () => {
  it("user 버블과 AI 버블을 렌더링한다", () => {
    render(<MessageList messages={SEED_MESSAGES} />);
    expect(screen.getByText("프로젝트 기획서의 핵심 목표가 무엇인가요?")).toBeInTheDocument();
    expect(screen.getByText("AI 응답 텍스트입니다.")).toBeInTheDocument();
  });

  it("AI 버블에 출처 칩 2개를 렌더링한다", () => {
    render(<MessageList messages={SEED_MESSAGES} />);
    expect(screen.getByText("프로젝트 기획서 · p.3")).toBeInTheDocument();
    expect(screen.getByText("API 설계 문서 · p.1")).toBeInTheDocument();
  });

  it("빈 messages 배열 시 빈 상태 문구를 표시한다", () => {
    render(<MessageList messages={[]} />);
    expect(screen.getByText("대화를 시작해 보세요")).toBeInTheDocument();
  });

  it("빈 상태에서 예시 질문 3개를 표시한다", () => {
    render(<MessageList messages={[]} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(3);
  });

  it("예시 질문 클릭 시 onExampleQuestion 를 호출한다", async () => {
    const user = userEvent.setup();
    const onExampleQuestion = vi.fn();
    render(<MessageList messages={[]} onExampleQuestion={onExampleQuestion} />);
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);
    expect(onExampleQuestion).toHaveBeenCalled();
  });

  it("isPending=true 일 때 로딩 문구를 표시한다", () => {
    render(<MessageList messages={SEED_MESSAGES} isPending />);
    expect(screen.getByText("AI가 응답 중이에요...")).toBeInTheDocument();
  });
});
