import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/chat",
}));

import ChatPage from "@/app/(app)/chat/page";

describe("ChatPage", () => {
  it("시드 대화(user 버블 1개 + AI 버블 1개)를 렌더링한다", () => {
    render(<ChatPage />);
    expect(screen.getByText("프로젝트 기획서의 핵심 목표가 무엇인가요?")).toBeInTheDocument();
    expect(screen.getByText(/프로젝트 기획서에 따르면/)).toBeInTheDocument();
  });

  it("AI 버블에 출처 칩 2개를 렌더링한다", () => {
    render(<ChatPage />);
    expect(screen.getByText("프로젝트 기획서 · p.3")).toBeInTheDocument();
    expect(screen.getByText("API 설계 문서 · p.1")).toBeInTheDocument();
  });

  it("빈 입력 시 전송 버튼은 disabled 이다", () => {
    render(<ChatPage />);
    expect(screen.getByRole("button", { name: "전송" })).toBeDisabled();
  });

  it("메시지 전송 후 사용자 메시지가 목록에 추가된다", async () => {
    vi.useFakeTimers();
    try {
      render(<ChatPage />);
      const textarea = screen.getByRole("textbox", { name: "메시지 입력" });

      act(() => {
        fireEvent.change(textarea, { target: { value: "새 질문입니다" } });
      });

      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "전송" }));
      });

      expect(screen.getByText("새 질문입니다")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("전송 후 입력창이 초기화된다", async () => {
    vi.useFakeTimers();
    try {
      render(<ChatPage />);
      const textarea = screen.getByRole("textbox", { name: "메시지 입력" });

      act(() => {
        fireEvent.change(textarea, { target: { value: "새 질문입니다" } });
      });

      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "전송" }));
      });

      expect(textarea).toHaveValue("");
    } finally {
      vi.useRealTimers();
    }
  });

  it("700ms 후 AI 응답이 추가된다", async () => {
    vi.useFakeTimers();
    try {
      render(<ChatPage />);
      const textarea = screen.getByRole("textbox", { name: "메시지 입력" });

      act(() => {
        fireEvent.change(textarea, { target: { value: "새 질문" } });
      });

      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "전송" }));
      });

      // 전송 직후 AI pending 상태
      expect(screen.getByText("AI가 응답 중이에요...")).toBeInTheDocument();

      // 700ms 진행
      await act(async () => {
        vi.advanceTimersByTime(700);
      });

      // AI 응답 추가 후 pending 문구 사라짐
      expect(screen.queryByText("AI가 응답 중이에요...")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("시드 메시지가 있을 때 빈 상태가 표시되지 않는다", () => {
    render(<ChatPage />);
    expect(screen.queryByText("대화를 시작해 보세요")).not.toBeInTheDocument();
  });
});
