import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { ComposerWithRef, ComposerRefHandle } from "@/features/chat/components/ComposerWithRef";

describe("ComposerWithRef", () => {
  it("초기 전송 버튼이 disabled 상태이다", () => {
    render(<ComposerWithRef onSend={vi.fn()} />);
    expect(screen.getByRole("button", { name: "전송" })).toBeDisabled();
  });

  it("텍스트 입력 후 전송 버튼이 활성화된다", async () => {
    const user = userEvent.setup();
    render(<ComposerWithRef onSend={vi.fn()} />);
    const textarea = screen.getByRole("textbox", { name: "메시지 입력" });
    await user.type(textarea, "안녕하세요");
    expect(screen.getByRole("button", { name: "전송" })).not.toBeDisabled();
  });

  it("공백만 입력 시 전송 버튼이 disabled 이다", async () => {
    const user = userEvent.setup();
    render(<ComposerWithRef onSend={vi.fn()} />);
    const textarea = screen.getByRole("textbox", { name: "메시지 입력" });
    await user.type(textarea, "   ");
    expect(screen.getByRole("button", { name: "전송" })).toBeDisabled();
  });

  it("전송 버튼 클릭 시 onSend 콜백이 호출되고 입력창이 초기화된다", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ComposerWithRef onSend={onSend} />);
    const textarea = screen.getByRole("textbox", { name: "메시지 입력" });
    await user.type(textarea, "안녕하세요");
    await user.click(screen.getByRole("button", { name: "전송" }));
    expect(onSend).toHaveBeenCalledWith("안녕하세요");
    expect(textarea).toHaveValue("");
  });

  it("Enter 키 입력 시 onSend 가 호출된다", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ComposerWithRef onSend={onSend} />);
    const textarea = screen.getByRole("textbox", { name: "메시지 입력" });
    await user.type(textarea, "메시지{Enter}");
    expect(onSend).toHaveBeenCalledWith("메시지");
  });

  it("Shift+Enter 는 줄바꿈이고 onSend 가 호출되지 않는다", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ComposerWithRef onSend={onSend} />);
    const textarea = screen.getByRole("textbox", { name: "메시지 입력" });
    await user.type(textarea, "메시지");
    await user.type(textarea, "{Shift>}{Enter}{/Shift}");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("ref.setValue() 호출 시 입력창에 값이 세팅된다", async () => {
    const ref = createRef<ComposerRefHandle>();
    render(<ComposerWithRef onSend={vi.fn()} ref={ref} />);
    const textarea = screen.getByRole("textbox", { name: "메시지 입력" });
    act(() => {
      ref.current?.setValue("자동 입력된 텍스트");
    });
    expect(textarea).toHaveValue("자동 입력된 텍스트");
  });
});
