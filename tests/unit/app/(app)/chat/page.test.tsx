import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const mockSearchParamsGet = vi.fn<(key: string) => string | null>(() => null);

// jsdom은 scrollTo를 구현하지 않으므로 mock 추가
Object.defineProperty(HTMLElement.prototype, "scrollTo", {
  configurable: true,
  value: vi.fn(),
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/chat",
  useSearchParams: () => ({ get: mockSearchParamsGet }),
}));

// useSessionQuery 모킹
let _mockSessionData: {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  messages: Array<{
    id: string;
    session_id: string;
    role: "user" | "assistant";
    content: string;
    sources: null | Array<{ file_id: string; filename: string; page: number }>;
    created_at: string;
  }>;
} | undefined = undefined;
let _mockSessionLoading = false;

vi.mock("@/features/chat/queries", () => ({
  useSessionQuery: vi.fn(() => ({
    data: _mockSessionData,
    isLoading: _mockSessionLoading,
    isError: false,
  })),
  useCreateSessionMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}));

// useStreamMessage 모킹
const _mockSend = vi.fn();
let _mockIsStreaming = false;

vi.mock("@/features/chat/hooks/useStreamMessage", () => ({
  useStreamMessage: vi.fn(() => ({
    send: _mockSend,
    isStreaming: _mockIsStreaming,
  })),
}));

// useChatStore 모킹
let _mockStreamingText = "";
let _mockSources: Array<{ file_id: string; filename: string; page: number }> = [];

vi.mock("@/features/chat/store", () => ({
  useChatStore: vi.fn(() => ({
    streamingSessionId: null,
    streamingText: _mockStreamingText,
    sources: _mockSources,
    isStreaming: _mockIsStreaming,
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

import ChatPage from "@/app/(app)/chat/page";

describe("ChatPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsGet.mockReturnValue(null);
    _mockSessionData = undefined;
    _mockSessionLoading = false;
    _mockIsStreaming = false;
    _mockStreamingText = "";
    _mockSources = [];
  });

  it("session 파라미터가 없을 때 빈 상태를 표시한다", () => {
    render(<ChatPage />, { wrapper: createWrapper() });
    expect(screen.getByText("대화를 시작해 보세요")).toBeInTheDocument();
  });

  it("session 파라미터가 있을 때 메시지 목록을 렌더링한다", () => {
    mockSearchParamsGet.mockReturnValue("s1");
    _mockSessionData = {
      id: "s1",
      title: "세션1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      messages: [
        {
          id: "m1",
          session_id: "s1",
          role: "user",
          content: "안녕하세요",
          sources: null,
          created_at: "2024-01-01T00:00:00Z",
        },
      ],
    };

    render(<ChatPage />, { wrapper: createWrapper() });
    expect(screen.getByText("안녕하세요")).toBeInTheDocument();
  });

  it("빈 입력 시 전송 버튼은 disabled이다", () => {
    render(<ChatPage />, { wrapper: createWrapper() });
    expect(screen.getByRole("button", { name: "전송" })).toBeDisabled();
  });

  it("isStreaming=true 시 전송 버튼이 disabled이다", () => {
    _mockIsStreaming = true;
    render(<ChatPage />, { wrapper: createWrapper() });
    expect(screen.getByRole("button", { name: "전송" })).toBeDisabled();
  });

  it("메시지 전송 시 send 함수를 호출한다", async () => {
    const user = userEvent.setup();
    mockSearchParamsGet.mockReturnValue("s1");
    _mockSend.mockResolvedValue(undefined);

    render(<ChatPage />, { wrapper: createWrapper() });
    const textarea = screen.getByRole("textbox", { name: "메시지 입력" });
    await user.type(textarea, "테스트 메시지");
    await user.click(screen.getByRole("button", { name: "전송" }));

    expect(_mockSend).toHaveBeenCalledWith("테스트 메시지");
  });

  it("sessionId가 없으면 전송 버튼이 disabled이다", () => {
    mockSearchParamsGet.mockReturnValue(null);

    render(<ChatPage />, { wrapper: createWrapper() });
    // sessionId 없으면 ComposerWithRef가 disabled 상태
    expect(screen.getByRole("button", { name: "전송" })).toBeDisabled();
  });
});
