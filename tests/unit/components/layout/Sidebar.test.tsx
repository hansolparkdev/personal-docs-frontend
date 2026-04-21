import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const mockPush = vi.fn();
const mockPathname = vi.fn(() => "/");
const mockLogoutMutate = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: mockPush }),
}));

let _mockIsLoading = false;
const _mockUser = { user_id: "1", username: "parktest", email: "park@example.com", name: "박한솔" };

vi.mock("@/features/auth/queries", () => ({
  useMeQuery: vi.fn(() => ({
    data: _mockIsLoading ? undefined : _mockUser,
    isLoading: _mockIsLoading,
    isError: false,
  })),
  useLogoutMutation: vi.fn(() => ({
    mutate: mockLogoutMutate,
    isPending: false,
  })),
}));

// chat queries 모킹
let _mockSessions: Array<{ id: string; title: string | null; created_at: string; updated_at: string }> = [];
let _mockSessionsLoading = false;
const _mockCreateSession = vi.fn();
const _mockDeleteSession = vi.fn();

vi.mock("@/features/chat/queries", () => ({
  useSessionsQuery: vi.fn(() => ({
    data: _mockSessionsLoading ? undefined : _mockSessions,
    isLoading: _mockSessionsLoading,
    isError: false,
  })),
  useCreateSessionMutation: vi.fn(() => ({
    mutate: _mockCreateSession,
    mutateAsync: _mockCreateSession,
    isPending: false,
  })),
  useDeleteSessionMutation: vi.fn(() => ({
    mutate: _mockDeleteSession,
    isPending: false,
  })),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

import { Sidebar } from "@/components/layout/Sidebar";

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/");
    _mockIsLoading = false;
    _mockSessions = [];
    _mockSessionsLoading = false;
    _mockDeleteSession.mockReset();
  });

  it("WordMark를 렌더링한다", () => {
    render(<Sidebar />, { wrapper: createWrapper() });
    expect(screen.getByTestId("wordmark-dot")).toBeInTheDocument();
    expect(screen.getByText("Personal Docs")).toBeInTheDocument();
  });

  it("새 챗 시작 버튼을 렌더링한다", () => {
    render(<Sidebar />, { wrapper: createWrapper() });
    expect(screen.getByText("새 챗 시작")).toBeInTheDocument();
  });

  it("내 문서 메뉴 항목을 렌더링한다", () => {
    render(<Sidebar />, { wrapper: createWrapper() });
    expect(screen.getByText("내 문서")).toBeInTheDocument();
  });

  it("useMeQuery에서 받은 유저 이름을 표시한다", () => {
    render(<Sidebar />, { wrapper: createWrapper() });
    expect(screen.getByText("박한솔")).toBeInTheDocument();
  });

  it("useMeQuery에서 받은 이메일을 표시한다", () => {
    render(<Sidebar />, { wrapper: createWrapper() });
    expect(screen.getByText("park@example.com")).toBeInTheDocument();
  });

  it("로딩 중에는 스켈레톤을 렌더링한다", () => {
    _mockIsLoading = true;
    const { container } = render(<Sidebar />, { wrapper: createWrapper() });
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("로그아웃 버튼 클릭 시 useLogoutMutation.mutate를 호출한다", async () => {
    const user = userEvent.setup();
    render(<Sidebar />, { wrapper: createWrapper() });
    const logoutBtn = screen.getByRole("button", { name: "로그아웃" });
    await user.click(logoutBtn);
    expect(mockLogoutMutate).toHaveBeenCalled();
  });

  it("새 챗 시작 클릭 시 createSession mutation을 호출한다", async () => {
    const user = userEvent.setup();
    _mockCreateSession.mockResolvedValue({
      id: "new-session",
      title: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    });
    render(<Sidebar />, { wrapper: createWrapper() });
    await user.click(screen.getByText("새 챗 시작"));
    expect(_mockCreateSession).toHaveBeenCalled();
  });

  it("/docs 경로일 때 내 문서가 활성화된다", () => {
    mockPathname.mockReturnValue("/docs");
    render(<Sidebar />, { wrapper: createWrapper() });
    const docsButton = screen.getByText("내 문서").closest("button");
    expect(docsButton?.className).toContain("bg-accent");
  });

  it("세션이 없으면 빈 상태 문구를 표시한다", () => {
    _mockSessions = [];
    render(<Sidebar />, { wrapper: createWrapper() });
    expect(screen.getByText("아직 대화 기록이 없어요")).toBeInTheDocument();
  });

  it("세션 목록 3개를 렌더링한다", () => {
    _mockSessions = [
      { id: "1", title: "첫 번째 대화", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
      { id: "2", title: "두 번째 대화", created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z" },
      { id: "3", title: "세 번째 대화", created_at: "2024-01-03T00:00:00Z", updated_at: "2024-01-03T00:00:00Z" },
    ];
    render(<Sidebar />, { wrapper: createWrapper() });
    expect(screen.getByText("첫 번째 대화")).toBeInTheDocument();
    expect(screen.getByText("두 번째 대화")).toBeInTheDocument();
    expect(screen.getByText("세 번째 대화")).toBeInTheDocument();
  });

  it("title이 null인 세션은 '새 대화'로 표시한다", () => {
    _mockSessions = [
      { id: "1", title: null, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
    ];
    render(<Sidebar />, { wrapper: createWrapper() });
    expect(screen.getByText("새 대화")).toBeInTheDocument();
  });

  it("세션 클릭 시 /chat?session={id}로 이동한다", async () => {
    const user = userEvent.setup();
    _mockSessions = [
      { id: "s1", title: "세션1", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
    ];
    render(<Sidebar />, { wrapper: createWrapper() });
    await user.click(screen.getByText("세션1"));
    expect(mockPush).toHaveBeenCalledWith("/chat?session=s1");
  });

  it("세션 삭제 버튼 클릭 시 deleteSessionMutation.mutate를 호출한다", async () => {
    const user = userEvent.setup();
    _mockSessions = [
      { id: "s1", title: "세션1", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
    ];
    render(<Sidebar />, { wrapper: createWrapper() });
    const deleteBtn = screen.getByRole("button", { name: "대화 삭제" });
    await user.click(deleteBtn);
    expect(_mockDeleteSession).toHaveBeenCalledWith("s1");
  });

  it("Sidebar 는 w-[260px] 클래스를 가진다", () => {
    const { container } = render(<Sidebar />, { wrapper: createWrapper() });
    const aside = container.querySelector("aside");
    expect(aside?.className).toContain("w-[260px]");
  });
});
