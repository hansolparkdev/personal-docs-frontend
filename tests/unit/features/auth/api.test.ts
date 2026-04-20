import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("auth/api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("login: POST /auth/login으로 username, password를 전송한다", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue({
      access_token: "tok",
      refresh_token: "ref",
      token_type: "bearer",
      expires_in: 3600,
    });

    const { login } = await import("@/features/auth/api");
    await login("testuser", "pass123");

    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      username: "testuser",
      password: "pass123",
    });
  });

  it("register: POST /auth/register로 회원가입 데이터를 전송한다", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue({ user_id: "1", username: "newuser" });

    const { register } = await import("@/features/auth/api");
    await register({ username: "newuser", email: "a@b.com", password: "pass", name: "홍길동" });

    expect(api.post).toHaveBeenCalledWith("/auth/register", {
      username: "newuser",
      email: "a@b.com",
      password: "pass",
      name: "홍길동",
    });
  });

  it("logout: POST /auth/logout으로 요청한다", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue(undefined);

    const { logout } = await import("@/features/auth/api");
    await logout();

    expect(api.post).toHaveBeenCalledWith("/auth/logout", {});
  });

  it("refreshToken: POST /auth/refresh로 요청한다", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue({
      access_token: "new_tok",
      refresh_token: "new_ref",
      token_type: "bearer",
      expires_in: 3600,
    });

    const { refreshToken } = await import("@/features/auth/api");
    await refreshToken();

    expect(api.post).toHaveBeenCalledWith("/auth/refresh", {});
  });

  it("getMe: GET /auth/me로 요청한다", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.get).mockResolvedValue({ user_id: "1", username: "testuser", email: "a@b.com", name: null });

    const { getMe } = await import("@/features/auth/api");
    await getMe();

    expect(api.get).toHaveBeenCalledWith("/auth/me");
  });

  it("getSsoUrl: Keycloak 인증 URL을 구성한다", async () => {
    const { getSsoUrl } = await import("@/features/auth/api");
    const url = getSsoUrl("http://localhost:3000/auth/callback");

    expect(url).toContain("/auth/sso");
    expect(url).toContain(encodeURIComponent("http://localhost:3000/auth/callback"));
  });

  it("exchangeCode: GET /auth/callback으로 code와 redirectUri를 전송한다", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.get).mockResolvedValue({
      access_token: "tok",
      refresh_token: "ref",
      token_type: "bearer",
      expires_in: 3600,
    });

    const { exchangeCode } = await import("@/features/auth/api");
    await exchangeCode("auth_code_123", "http://localhost:3000/auth/callback");

    expect(api.get).toHaveBeenCalledWith(
      "/auth/callback?code=auth_code_123&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback"
    );
  });
});
