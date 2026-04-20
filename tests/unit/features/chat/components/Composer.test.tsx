import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Composer } from "@/features/chat/components/Composer";

describe("Composer", () => {
  it("텍스트 입력창을 렌더링한다", () => {
    render(<Composer value="" onChange={vi.fn()} onSend={vi.fn()} />);
    expect(screen.getByRole("textbox", { name: "메시지 입력" })).toBeInTheDocument();
  });

  it("전송 버튼을 렌더링한다", () => {
    render(<Composer value="" onChange={vi.fn()} onSend={vi.fn()} />);
    expect(screen.getByRole("button", { name: "전송" })).toBeInTheDocument();
  });

  it("빈 입력 시 전송 버튼이 disabled 이다", () => {
    render(<Composer value="" onChange={vi.fn()} onSend={vi.fn()} />);
    expect(screen.getByRole("button", { name: "전송" })).toBeDisabled();
  });

  it("공백만 입력 시 전송 버튼이 disabled 이다", () => {
    render(<Composer value="   " onChange={vi.fn()} onSend={vi.fn()} />);
    expect(screen.getByRole("button", { name: "전송" })).toBeDisabled();
  });

  it("텍스트 입력 시 전송 버튼이 활성화된다", () => {
    render(<Composer value="안녕하세요" onChange={vi.fn()} onSend={vi.fn()} />);
    expect(screen.getByRole("button", { name: "전송" })).not.toBeDisabled();
  });

  it("전송 버튼 클릭 시 onSend 를 호출한다", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    const onChange = vi.fn();
    render(<Composer value="안녕하세요" onChange={onChange} onSend={onSend} />);
    await user.click(screen.getByRole("button", { name: "전송" }));
    expect(onSend).toHaveBeenCalledWith("안녕하세요");
  });

  it("전송 후 onChange('') 가 호출되어 입력창이 초기화된다", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    const onChange = vi.fn();
    render(<Composer value="안녕하세요" onChange={onChange} onSend={onSend} />);
    await user.click(screen.getByRole("button", { name: "전송" }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("Enter 키 입력 시 onSend 가 호출된다", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    const onChange = vi.fn();
    render(<Composer value="메시지" onChange={onChange} onSend={onSend} />);
    const textarea = screen.getByRole("textbox", { name: "메시지 입력" });
    await user.type(textarea, "{Enter}");
    expect(onSend).toHaveBeenCalledWith("메시지");
  });

  it("Shift+Enter 는 줄바꿈이고 onSend 가 호출되지 않는다", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<Composer value="메시지" onChange={vi.fn()} onSend={onSend} />);
    const textarea = screen.getByRole("textbox", { name: "메시지 입력" });
    await user.type(textarea, "{Shift>}{Enter}{/Shift}");
    expect(onSend).not.toHaveBeenCalled();
  });
});
