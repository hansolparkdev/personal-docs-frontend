import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

vi.mock("@/features/chat/api", () => ({
  sendMessage: vi.fn(),
}));

import { sendMessage } from "@/features/chat/api";
import { useStreamMessage } from "@/features/chat/hooks/useStreamMessage";
import { useChatStore } from "@/features/chat/store";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { Wrapper, queryClient };
}

function makeStream(lines: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line));
      }
      controller.close();
    },
  });
}

describe("useStreamMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useChatStore.getState().reset();
  });

  it("sessionId가 null이면 send를 호출해도 sendMessage를 호출하지 않는다", async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useStreamMessage(null), { wrapper: Wrapper });

    await act(async () => {
      await result.current.send("안녕");
    });

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("isStreaming과 send를 반환한다", () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useStreamMessage("s1"), { wrapper: Wrapper });

    expect(typeof result.current.isStreaming).toBe("boolean");
    expect(typeof result.current.send).toBe("function");
  });

  it("token 이벤트 수신 시 streamingText가 누적된다", async () => {
    const stream = makeStream([
      'event: token\ndata: {"text":"안녕"}\n\n',
      'event: token\ndata: {"text":"하세요"}\n\n',
    ]);
    vi.mocked(sendMessage).mockResolvedValue(stream);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useStreamMessage("s1"), { wrapper: Wrapper });

    await act(async () => {
      await result.current.send("테스트");
    });

    expect(useChatStore.getState().streamingText).toBe("안녕하세요");
  });

  it("sources 이벤트 수신 시 sources가 설정된다", async () => {
    const sourcesData = [{ file_id: "f1", filename: "doc.pdf", page_number: 1 }];
    const stream = makeStream([
      `event: sources\ndata: {"sources":${JSON.stringify(sourcesData)}}\n\n`,
    ]);
    vi.mocked(sendMessage).mockResolvedValue(stream);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useStreamMessage("s1"), { wrapper: Wrapper });

    await act(async () => {
      await result.current.send("테스트");
    });

    expect(useChatStore.getState().sources).toEqual(sourcesData);
  });

  it("done 이벤트 수신 시 isStreaming이 false가 된다", async () => {
    const stream = makeStream([
      'event: token\ndata: {"text":"hi"}\n\n',
      'event: done\ndata: {"text":""}\n\n',
    ]);
    vi.mocked(sendMessage).mockResolvedValue(stream);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useStreamMessage("s1"), { wrapper: Wrapper });

    await act(async () => {
      await result.current.send("테스트");
    });

    expect(useChatStore.getState().isStreaming).toBe(false);
  });

  it("sendMessage 실패 시 에러를 throw한다", async () => {
    vi.mocked(sendMessage).mockRejectedValue(new Error("Network error"));

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useStreamMessage("s1"), { wrapper: Wrapper });

    await expect(
      act(async () => {
        await result.current.send("테스트");
      })
    ).rejects.toThrow("Network error");
  });
});
