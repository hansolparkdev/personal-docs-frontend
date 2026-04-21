import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MessageList } from "@/features/chat/components/MessageList";
import type { ChatMessage } from "@/features/chat/types";

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    session_id: "s1",
    role: "user",
    content: "프로젝트 기획서의 핵심 목표가 무엇인가요?",
    sources: null,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    session_id: "s1",
    role: "assistant",
    content: "AI 응답 텍스트입니다.",
    sources: [
      { file_id: "f1", filename: "프로젝트 기획서.pdf", page_number: 3 },
      { file_id: "f2", filename: "API 설계 문서.pdf", page_number: 1 },
    ],
    created_at: "2024-01-01T00:00:01Z",
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
    expect(screen.getByText("프로젝트 기획서.pdf · p.3")).toBeInTheDocument();
    expect(screen.getByText("API 설계 문서.pdf · p.1")).toBeInTheDocument();
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

  it("isStreaming=true 일 때 스트리밍 버블을 표시한다", () => {
    render(
      <MessageList
        messages={SEED_MESSAGES}
        isStreaming
        streamingText="스트리밍 중..."
      />
    );
    expect(screen.getByText("스트리밍 중...")).toBeInTheDocument();
  });

  it("isStreaming=false 이면 스트리밍 버블이 없다", () => {
    render(
      <MessageList
        messages={SEED_MESSAGES}
        isStreaming={false}
        streamingText="텍스트"
      />
    );
    expect(screen.queryByText("텍스트")).not.toBeInTheDocument();
  });

  it("sources가 있으면 isStreaming 버블 하단에 출처 칩을 표시한다", () => {
    const sources = [{ file_id: "f1", filename: "source.pdf", page_number: 5 }];
    render(
      <MessageList
        messages={SEED_MESSAGES}
        isStreaming
        streamingText="응답 중"
        streamingSources={sources}
      />
    );
    expect(screen.getByText("source.pdf · p.5")).toBeInTheDocument();
  });
});
