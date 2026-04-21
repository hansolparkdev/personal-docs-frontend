import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSession, listSessions, getSession, deleteSession, sendMessage } from "@/features/chat/api";

// lib/api 모킹
vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "@/lib/api";

describe("chat api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSession", () => {
    it("POST /chats를 호출하고 ChatSession을 반환한다", async () => {
      const mockSession = {
        id: "s1",
        title: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };
      vi.mocked(api.post).mockResolvedValue(mockSession);

      const result = await createSession();

      expect(api.post).toHaveBeenCalledWith("/chats", {});
      expect(result).toEqual(mockSession);
    });
  });

  describe("listSessions", () => {
    it("GET /chats를 호출하고 ChatSession 배열을 반환한다", async () => {
      const mockSessions = [
        { id: "s1", title: "세션1", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
        { id: "s2", title: null, created_at: "2024-01-02T00:00:00Z", updated_at: "2024-01-02T00:00:00Z" },
      ];
      vi.mocked(api.get).mockResolvedValue(mockSessions);

      const result = await listSessions();

      expect(api.get).toHaveBeenCalledWith("/chats");
      expect(result).toEqual(mockSessions);
    });
  });

  describe("getSession", () => {
    it("GET /chats/{sessionId}를 호출하고 ChatSessionDetail을 반환한다", async () => {
      const mockDetail = {
        id: "s1",
        title: "세션1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        messages: [],
      };
      vi.mocked(api.get).mockResolvedValue(mockDetail);

      const result = await getSession("s1");

      expect(api.get).toHaveBeenCalledWith("/chats/s1");
      expect(result).toEqual(mockDetail);
    });
  });

  describe("deleteSession", () => {
    it("DELETE /chats/{sessionId}를 호출한다", async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);

      await deleteSession("s1");

      expect(api.delete).toHaveBeenCalledWith("/chats/s1");
    });
  });

  describe("sendMessage", () => {
    it("fetch를 직접 호출하고 ReadableStream을 반환한다", async () => {
      const encoder = new TextEncoder();
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('data: {"type":"token","content":"hi"}\n\n'));
          controller.close();
        },
      });

      global.fetch = vi.fn().mockResolvedValue(
        new Response(mockStream, {
          status: 200,
          headers: { "Content-Type": "text/event-stream" },
        })
      );

      const result = await sendMessage("s1", "안녕하세요");

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/chats/s1/messages",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ content: "안녕하세요" }),
        })
      );
      expect(result).toBeInstanceOf(ReadableStream);
    });

    it("fetch 실패 시 에러를 throw한다", async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "Not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      );

      await expect(sendMessage("s1", "안녕")).rejects.toThrow();
    });
  });
});
