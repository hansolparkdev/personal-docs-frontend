import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockGetCookie = vi.fn((name: string) => {
  if (name === "access_token") return { value: "test_access_token" };
  return undefined;
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ get: mockGetCookie })),
}));

vi.stubEnv("BACKEND_URL", "http://backend:8000");

describe("apiServer (서버 fetcher)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCookie.mockImplementation((name: string) => {
      if (name === "access_token") return { value: "test_access_token" };
      return undefined;
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("BACKEND_URL을 baseURL로 사용한다", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user_id: "1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const { apiServer } = await import("@/lib/api-server");
    await apiServer.get("/auth/me");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend:8000/auth/me",
      expect.any(Object)
    );
  });

  it("access_token 쿠키를 Authorization 헤더에 첨부한다", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user_id: "1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const { apiServer } = await import("@/lib/api-server");
    await apiServer.get("/auth/me");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test_access_token",
        }),
      })
    );
  });

  it("쿠키가 없으면 Authorization 헤더 없이 요청한다", async () => {
    mockGetCookie.mockReturnValue(undefined);

    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const { apiServer } = await import("@/lib/api-server");
    await apiServer.get("/public/info");

    const call = vi.mocked(global.fetch).mock.calls[0];
    const fetchHeaders = (call[1] as RequestInit).headers as Record<string, string>;
    expect(fetchHeaders?.Authorization).toBeUndefined();
  });

  it("401 응답 시 에러를 throw한다", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ detail: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );

    const { apiServer } = await import("@/lib/api-server");
    await expect(apiServer.get("/auth/me")).rejects.toThrow();
  });
});
