import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// API 모킹
vi.mock("@/features/chat/api", () => ({
  listSessions: vi.fn(),
  getSession: vi.fn(),
  createSession: vi.fn(),
  deleteSession: vi.fn(),
}));

import { listSessions, getSession, createSession, deleteSession } from "@/features/chat/api";
import {
  useSessionsQuery,
  useSessionQuery,
  useCreateSessionMutation,
  useDeleteSessionMutation,
} from "@/features/chat/queries";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { Wrapper, queryClient };
}

describe("useSessionsQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /chats 세션 목록을 반환한다", async () => {
    const mockSessions = [
      { id: "s1", title: "세션1", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
    ];
    vi.mocked(listSessions).mockResolvedValue(mockSessions);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSessionsQuery(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockSessions);
    expect(listSessions).toHaveBeenCalledOnce();
  });

  it("에러 발생 시 isError=true가 된다", async () => {
    vi.mocked(listSessions).mockRejectedValue(new Error("Network error"));

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSessionsQuery(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useSessionQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sessionId가 있을 때 GET /chats/{id}를 호출한다", async () => {
    const mockDetail = {
      id: "s1",
      title: "세션1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      messages: [],
    };
    vi.mocked(getSession).mockResolvedValue(mockDetail);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSessionQuery("s1"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getSession).toHaveBeenCalledWith("s1");
    expect(result.current.data).toEqual(mockDetail);
  });

  it("sessionId가 null이면 쿼리를 실행하지 않는다", () => {
    vi.mocked(getSession).mockResolvedValue({
      id: "s1",
      title: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      messages: [],
    });

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSessionQuery(null), { wrapper: Wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(getSession).not.toHaveBeenCalled();
  });
});

describe("useCreateSessionMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /chats 성공 시 sessions 쿼리를 무효화한다", async () => {
    const mockSession = {
      id: "s2",
      title: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    vi.mocked(createSession).mockResolvedValue(mockSession);

    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateSessionMutation(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(createSession).toHaveBeenCalledOnce();
    expect(invalidateSpy).toHaveBeenCalled();
  });
});

describe("useDeleteSessionMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("DELETE /chats/{id} 성공 시 sessions 쿼리를 무효화한다", async () => {
    vi.mocked(deleteSession).mockResolvedValue(undefined);

    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteSessionMutation(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync("s1");
    });

    expect(deleteSession).toHaveBeenCalledWith("s1");
    expect(invalidateSpy).toHaveBeenCalled();
  });
});
