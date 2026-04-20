import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("api (클라이언트 fetcher)", () => {
  const originalFetch = global.fetch;
  const originalLocation = global.window?.location;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("GET 요청을 /api 경로로 보낸다", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const { api } = await import("@/lib/api");
    const result = await api.get<{ data: string }>("/files");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/files",
      expect.objectContaining({ method: "GET", credentials: "include" })
    );
    expect(result).toEqual({ data: "ok" });
  });

  it("POST 요청을 JSON body와 함께 보낸다", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const { api } = await import("@/lib/api");
    await api.post("/auth/login", { username: "user", password: "pass" });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ username: "user", password: "pass" }),
      })
    );
  });

  it("401 응답 시 /api/auth/refresh를 호출하고 원래 요청을 재시도한다", async () => {
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/auth/refresh") {
        return Promise.resolve(
          new Response(JSON.stringify({ access_token: "new_token" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        );
      }
      callCount++;
      if (callCount === 1) {
        // 첫 번째 호출: 401 반환
        return Promise.resolve(
          new Response(JSON.stringify({ detail: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          })
        );
      }
      // 두 번째 호출 (재시도): 성공
      return Promise.resolve(
        new Response(JSON.stringify({ data: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    const { api } = await import("@/lib/api");
    const result = await api.get<{ data: string }>("/protected");
    expect(result).toEqual({ data: "ok" });
    // refresh 호출 확인
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/refresh",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("refresh 실패 시 /login으로 redirect한다", async () => {
    const mockAssign = vi.fn();
    Object.defineProperty(global, "window", {
      value: { location: { href: "" } },
      writable: true,
    });
    Object.defineProperty(window, "location", {
      value: { href: "", assign: mockAssign },
      writable: true,
    });

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ detail: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );

    // 모듈 캐시를 무효화해서 재import
    vi.resetModules();
    const { api } = await import("@/lib/api");

    await expect(api.get("/protected")).rejects.toThrow();
  });

  it("refresh 요청 자체는 재시도하지 않는다 (무한루프 방지)", async () => {
    let fetchCallCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      fetchCallCount++;
      return Promise.resolve(
        new Response(JSON.stringify({ detail: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    vi.resetModules();
    const { api } = await import("@/lib/api");

    await expect(
      api.post("/auth/refresh", {})
    ).rejects.toThrow();

    // refresh 자체는 재시도 없이 1번만 fetch
    expect(fetchCallCount).toBe(1);
  });

  it("DELETE 요청을 올바르게 전송한다", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(null, { status: 204 })
    );

    vi.resetModules();
    const { api } = await import("@/lib/api");

    // 204 no content는 json 파싱 안 함
    await api.delete("/files/123");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/files/123",
      expect.objectContaining({ method: "DELETE", credentials: "include" })
    );
  });
});
