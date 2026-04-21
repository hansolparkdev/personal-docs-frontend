import { describe, it, expect, expectTypeOf } from "vitest";
import type {
  ChatSession,
  ChatMessage,
  ChatSessionDetail,
  Source,
  SSEEvent,
  SSEEventType,
} from "@/features/chat/types";

describe("chat types", () => {
  it("ChatSession 타입이 올바른 필드를 가진다", () => {
    const session: ChatSession = {
      id: "s1",
      title: "세션 제목",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    expectTypeOf(session.title).toEqualTypeOf<string | null>();
  });

  it("ChatSession의 title은 null 가능이다", () => {
    const session: ChatSession = {
      id: "s1",
      title: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };
    expect(session.title).toBeNull();
  });

  it("ChatMessage 타입이 올바른 role 값을 가진다", () => {
    const msg: ChatMessage = {
      id: "m1",
      session_id: "s1",
      role: "user",
      content: "안녕하세요",
      sources: null,
      created_at: "2024-01-01T00:00:00Z",
    };
    expectTypeOf(msg.role).toEqualTypeOf<"user" | "assistant">();
  });

  it("Source 타입이 올바른 필드를 가진다", () => {
    const source: Source = {
      file_id: "f1",
      filename: "document.pdf",
      page: 3,
    };
    expect(source.page).toBe(3);
  });

  it("ChatSessionDetail은 messages 배열을 포함한다", () => {
    const detail: ChatSessionDetail = {
      id: "s1",
      title: "세션",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      messages: [],
    };
    expectTypeOf(detail.messages).toEqualTypeOf<ChatMessage[]>();
  });

  it("SSEEventType은 token/sources/done/error를 포함한다", () => {
    const types: SSEEventType[] = ["token", "sources", "done", "error"];
    expect(types).toHaveLength(4);
  });

  it("SSEEvent content는 string 또는 Source[] 타입이다", () => {
    const tokenEvent: SSEEvent = { type: "token", content: "안녕" };
    const sourcesEvent: SSEEvent = {
      type: "sources",
      content: [{ file_id: "f1", filename: "doc.pdf", page: 1 }],
    };
    expect(tokenEvent.content).toBe("안녕");
    expect(Array.isArray(sourcesEvent.content)).toBe(true);
  });
});
