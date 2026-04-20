import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const mockPush = vi.fn();
const mockMutate = vi.fn();
const mockRegisterMutate = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/features/auth/queries", () => ({
  useLoginMutation: vi.fn(() => ({
    mutate: mockMutate,
    isPending: false,
    error: null,
  })),
  useRegisterMutation: vi.fn(() => ({
    mutate: mockRegisterMutate,
    isPending: false,
    error: null,
  })),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

import { LoginCard } from "@/features/auth/components/LoginCard";

describe("LoginCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("아이디 입력 필드를 렌더링한다", () => {
    render(<LoginCard />, { wrapper: createWrapper() });
    expect(screen.getByLabelText("아이디")).toBeInTheDocument();
  });

  it("비밀번호 입력 필드를 렌더링한다", () => {
    render(<LoginCard />, { wrapper: createWrapper() });
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
  });

  it("로그인 버튼을 렌더링한다", () => {
    render(<LoginCard />, { wrapper: createWrapper() });
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });

  it("SSO 버튼을 렌더링한다", () => {
    render(<LoginCard />, { wrapper: createWrapper() });
    expect(screen.getByRole("button", { name: "SSO로 로그인" })).toBeInTheDocument();
  });

  it("빈 폼 상태에서 로그인 버튼은 disabled 이다", () => {
    render(<LoginCard />, { wrapper: createWrapper() });
    expect(screen.getByRole("button", { name: "로그인" })).toBeDisabled();
  });

  it("아이디만 입력하면 로그인 버튼은 disabled 이다", async () => {
    const user = userEvent.setup();
    render(<LoginCard />, { wrapper: createWrapper() });
    await user.type(screen.getByLabelText("아이디"), "testuser");
    expect(screen.getByRole("button", { name: "로그인" })).toBeDisabled();
  });

  it("아이디·비밀번호 입력 시 로그인 버튼 활성화된다", async () => {
    const user = userEvent.setup();
    render(<LoginCard />, { wrapper: createWrapper() });
    await user.type(screen.getByLabelText("아이디"), "testuser");
    await user.type(screen.getByLabelText("비밀번호"), "password123");
    expect(screen.getByRole("button", { name: "로그인" })).not.toBeDisabled();
  });

  it("로그인 버튼 클릭 시 useLoginMutation.mutate를 호출한다", async () => {
    const user = userEvent.setup();
    render(<LoginCard />, { wrapper: createWrapper() });
    await user.type(screen.getByLabelText("아이디"), "testuser");
    await user.type(screen.getByLabelText("비밀번호"), "password123");
    await user.click(screen.getByRole("button", { name: "로그인" }));
    expect(mockMutate).toHaveBeenCalledWith({
      username: "testuser",
      password: "password123",
    });
  });

  it("isPending 상태에서 로그인 버튼이 disabled 된다", async () => {
    const { useLoginMutation } = await import("@/features/auth/queries");
    vi.mocked(useLoginMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      error: null,
    } as unknown as ReturnType<typeof useLoginMutation>);

    render(<LoginCard />, { wrapper: createWrapper() });
    // isPending 상태에서는 버튼 텍스트가 "로그인 중..."으로 변경됨
    expect(screen.getByRole("button", { name: "로그인 중..." })).toBeDisabled();
  });

  it("401 오류 시 '아이디 또는 비밀번호가 올바르지 않습니다.' 메시지를 표시한다", async () => {
    const { useLoginMutation } = await import("@/features/auth/queries");
    const error = new Error("401") as Error & { status: number };
    error.status = 401;
    vi.mocked(useLoginMutation).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error,
    } as unknown as ReturnType<typeof useLoginMutation>);

    render(<LoginCard />, { wrapper: createWrapper() });
    expect(
      screen.getByText("아이디 또는 비밀번호가 올바르지 않습니다.")
    ).toBeInTheDocument();
  });

  it("회원가입 탭으로 전환할 수 있다", async () => {
    const user = userEvent.setup();
    render(<LoginCard />, { wrapper: createWrapper() });
    await user.click(screen.getByRole("button", { name: "회원가입" }));
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByLabelText("이름")).toBeInTheDocument();
  });

  it("회원가입 폼에서 useRegisterMutation.mutate를 호출한다", async () => {
    const user = userEvent.setup();
    render(<LoginCard />, { wrapper: createWrapper() });

    await user.click(screen.getByRole("button", { name: "회원가입" }));
    await user.type(screen.getByLabelText("아이디"), "newuser");
    await user.type(screen.getByLabelText("이메일"), "new@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "password123");
    await user.type(screen.getByLabelText("이름"), "홍길동");
    await user.click(screen.getByRole("button", { name: "회원가입 완료" }));

    expect(mockRegisterMutate).toHaveBeenCalledWith({
      username: "newuser",
      email: "new@example.com",
      password: "password123",
      name: "홍길동",
    });
  });

  it("회원가입 409 오류 시 '이미 사용 중인 아이디입니다.' 메시지를 표시한다", async () => {
    const { useRegisterMutation } = await import("@/features/auth/queries");
    const user = userEvent.setup();

    const error = new Error("409") as Error & { status: number };
    error.status = 409;
    vi.mocked(useRegisterMutation).mockReturnValue({
      mutate: mockRegisterMutate,
      isPending: false,
      error,
    } as unknown as ReturnType<typeof useRegisterMutation>);

    render(<LoginCard />, { wrapper: createWrapper() });
    await user.click(screen.getByRole("button", { name: "회원가입" }));
    expect(
      screen.getByText("이미 사용 중인 아이디입니다.")
    ).toBeInTheDocument();
  });
});
