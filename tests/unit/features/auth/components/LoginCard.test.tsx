import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { LoginCard } from "@/features/auth/components/LoginCard";

describe("LoginCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("이메일 입력 필드를 렌더링한다", () => {
    render(<LoginCard />);
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
  });

  it("비밀번호 입력 필드를 렌더링한다", () => {
    render(<LoginCard />);
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
  });

  it("로그인 버튼을 렌더링한다", () => {
    render(<LoginCard />);
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });

  it("SSO 버튼을 렌더링한다", () => {
    render(<LoginCard />);
    expect(screen.getByRole("button", { name: "SSO로 로그인" })).toBeInTheDocument();
  });

  it("빈 폼 상태에서 로그인 버튼은 disabled 이다", () => {
    render(<LoginCard />);
    expect(screen.getByRole("button", { name: "로그인" })).toBeDisabled();
  });

  it("이메일만 입력하면 로그인 버튼은 disabled 이다", async () => {
    const user = userEvent.setup();
    render(<LoginCard />);
    await user.type(screen.getByLabelText("이메일"), "test@example.com");
    expect(screen.getByRole("button", { name: "로그인" })).toBeDisabled();
  });

  it("이메일·비밀번호 입력 시 로그인 버튼 활성화된다", async () => {
    const user = userEvent.setup();
    render(<LoginCard />);
    await user.type(screen.getByLabelText("이메일"), "test@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "password123");
    expect(screen.getByRole("button", { name: "로그인" })).not.toBeDisabled();
  });

  it("로그인 버튼 클릭 시 /docs 로 이동한다", async () => {
    const user = userEvent.setup();
    render(<LoginCard />);
    await user.type(screen.getByLabelText("이메일"), "test@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "password123");
    await user.click(screen.getByRole("button", { name: "로그인" }));
    expect(mockPush).toHaveBeenCalledWith("/docs");
  });

  it("SSO 버튼 클릭 시 /docs 로 이동한다", async () => {
    const user = userEvent.setup();
    render(<LoginCard />);
    await user.click(screen.getByRole("button", { name: "SSO로 로그인" }));
    expect(mockPush).toHaveBeenCalledWith("/docs");
  });
});
