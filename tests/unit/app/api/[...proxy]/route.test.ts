import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// BACKEND_URL 환경변수 mock
vi.stubEnv("BACKEND_URL", "http://backend:8000");

// next/headers mock — cookies는 request scope가 없는 테스트 환경에서 실패하므로 모킹
vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: (_name: string) => undefined,
    })
  ),
}));

describe("BFF Route Handler", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("일반 GET 요청을 백엔드로 프록시한다", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const { GET } = await import("@/app/api/[...proxy]/route");
    const req = new NextRequest("http://localhost:3000/api/files");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend:8000/files",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("로그인 응답에서 HttpOnly 쿠키를 설정한다", async () => {
    const tokenResponse = {
      access_token: "access123",
      refresh_token: "refresh456",
      token_type: "bearer",
      expires_in: 3600,
    };

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(tokenResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const { POST } = await import("@/app/api/[...proxy]/route");
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: "testuser", password: "pass" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    // Set-Cookie 헤더 확인
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("access_token=access123");
    expect(setCookie).toContain("HttpOnly");
  });

  it("refresh 응답에서 HttpOnly 쿠키를 갱신한다", async () => {
    const tokenResponse = {
      access_token: "new_access789",
      refresh_token: "new_refresh012",
      token_type: "bearer",
      expires_in: 3600,
    };

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(tokenResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const { POST } = await import("@/app/api/[...proxy]/route");
    const req = new NextRequest("http://localhost:3000/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("access_token=new_access789");
  });

  it("로그아웃 요청에서 쿠키를 삭제한다", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 200 })
    );

    const { POST } = await import("@/app/api/[...proxy]/route");
    const req = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    // 쿠키 만료 헤더 확인 (Max-Age=0 또는 expires 과거)
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("access_token=");
    expect(setCookie).toContain("Max-Age=0");
  });

  it("백엔드 오류 응답을 그대로 전달한다", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ detail: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );

    const { GET } = await import("@/app/api/[...proxy]/route");
    const req = new NextRequest("http://localhost:3000/api/auth/me");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("SSE(text/event-stream) 응답을 버퍼링 없이 body 스트림으로 중계한다", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"type":"token","content":"hello"}\n\n'));
        controller.close();
      },
    });

    global.fetch = vi.fn().mockResolvedValue(
      new Response(stream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const { POST } = await import("@/app/api/[...proxy]/route");
    const req = new NextRequest(
      "http://localhost:3000/api/chats/session-1/messages",
      { method: "POST", body: JSON.stringify({ content: "안녕" }) }
    );
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    // body가 ReadableStream으로 전달되는지 확인
    expect(res.body).toBeDefined();
  });
});
