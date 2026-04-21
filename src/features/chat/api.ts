import { api } from "@/lib/api";
import type { ChatSession, ChatSessionDetail } from "./types";

export async function createSession(): Promise<ChatSession> {
  return api.post<ChatSession>("/chats", {});
}

export async function listSessions(): Promise<ChatSession[]> {
  return api.get<ChatSession[]>("/chats");
}

export async function getSession(sessionId: string): Promise<ChatSessionDetail> {
  return api.get<ChatSessionDetail>(`/chats/${sessionId}`);
}

export async function deleteSession(sessionId: string): Promise<void> {
  return api.delete<void>(`/chats/${sessionId}`);
}

async function doSendMessage(sessionId: string, content: string): Promise<Response> {
  return fetch(`/api/chats/${sessionId}/messages`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

// SSE 메시지 전송 — fetch 직접 호출, 401 시 refresh 후 재시도, ReadableStream 반환
export async function sendMessage(
  sessionId: string,
  content: string
): Promise<ReadableStream<Uint8Array>> {
  let res = await doSendMessage(sessionId, content);

  // 401 시 refresh 후 1회 재시도
  if (res.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!refreshRes.ok) {
      window.location.href = "/login";
      throw new Error("[sendMessage] session expired");
    }
    res = await doSendMessage(sessionId, content);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const error = new Error(`[sendMessage] ${res.status} ${res.statusText}`) as Error & { status: number; body: unknown };
    error.status = res.status;
    error.body = errorBody;
    throw error;
  }

  if (!res.body) throw new Error("[sendMessage] response body is null");

  return res.body;
}
