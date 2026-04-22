"use client";

import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/lib/query-keys/chat";
import { sendMessage } from "../api";
import { useChatStore } from "../store";
import type { Source } from "../types";

export function useStreamMessage(sessionId: string | null) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const { appendToken, setSources, setStreaming, reset, isStreaming } =
    useChatStore();

  async function send(content: string): Promise<void> {
    if (!sessionId) return;

    // 이전 요청 취소
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    reset();
    setStreaming(true, sessionId);

    try {
      const stream = await sendMessage(sessionId, content);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE 블록 단위 파싱 (빈 줄로 구분)
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          const lines = block.split("\n");
          let eventType = currentEvent;
          let dataLine = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventType = line.slice("event: ".length).trim();
            } else if (line.startsWith("data: ")) {
              dataLine = line.slice("data: ".length).trim();
            }
          }

          if (!dataLine) continue;

          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(dataLine) as Record<string, unknown>;
          } catch {
            continue;
          }

          if (eventType === "token") {
            appendToken(parsed.text as string ?? "");
          } else if (eventType === "sources") {
            setSources((parsed.sources as Source[]) ?? []);
          } else if (eventType === "done") {
            setStreaming(false);
            if (sessionId) {
              await Promise.all([
                queryClient.invalidateQueries({ queryKey: chatKeys.session(sessionId) }),
                queryClient.invalidateQueries({ queryKey: chatKeys.sessions() }),
              ]);
            }
            reset();
          } else if (eventType === "error") {
            setStreaming(false);
            throw new Error(`[SSE error] ${String(parsed.message ?? parsed.error ?? "unknown")}`);
          }

          currentEvent = "";
        }
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        // 의도적 취소 — 조용히 처리
        return;
      }
      setStreaming(false);
      throw err;
    }
  }

  return { send, isStreaming };
}
