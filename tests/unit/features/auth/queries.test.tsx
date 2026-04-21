import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/features/auth/api", () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

const locationMock = { href: "" };
Object.defineProperty(window, "location", { value: locationMock, writable: true });

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("auth queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    locationMock.href = "";
  });

  describe("useMeQuery", () => {
    it("GET /auth/me 를 호출하여 유저 정보를 반환한다", async () => {
      const { getMe } = await import("@/features/auth/api");
      const mockUser = { user_id: "1", username: "testuser", email: "a@b.com", name: "테스트" };
      vi.mocked(getMe).mockResolvedValue(mockUser);

      const { useMeQuery } = await import("@/features/auth/queries");
      const { result } = renderHook(() => useMeQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockUser);
    });
  });

  describe("useLoginMutation", () => {
    it("성공 시 /docs로 이동한다", async () => {
      const { login } = await import("@/features/auth/api");
      vi.mocked(login).mockResolvedValue({
        access_token: "tok",
        refresh_token: "ref",
        token_type: "bearer",
        expires_in: 3600,
      });

      const { useLoginMutation } = await import("@/features/auth/queries");
      const { result } = renderHook(() => useLoginMutation(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ username: "user", password: "pass" });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(locationMock.href).toBe("/docs");
    });

    it("실패 시 에러를 반환한다", async () => {
      const { login } = await import("@/features/auth/api");
      const error = new Error("401") as Error & { status: number };
      error.status = 401;
      vi.mocked(login).mockRejectedValue(error);

      const { useLoginMutation } = await import("@/features/auth/queries");
      const { result } = renderHook(() => useLoginMutation(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({ username: "user", password: "wrong" });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(locationMock.href).not.toBe("/docs");
    });
  });

  describe("useLogoutMutation", () => {
    it("성공 시 /login으로 이동한다", async () => {
      const { logout } = await import("@/features/auth/api");
      vi.mocked(logout).mockResolvedValue(undefined);

      const { useLogoutMutation } = await import("@/features/auth/queries");
      const { result } = renderHook(() => useLogoutMutation(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(locationMock.href).toBe("/login");
    });
  });

  describe("useRegisterMutation", () => {
    it("성공 시 자동 로그인 후 /docs로 이동한다", async () => {
      const { register, login } = await import("@/features/auth/api");
      vi.mocked(register).mockResolvedValue({
        user_id: "1",
        username: "newuser",
        email: "a@b.com",
        name: "홍길동",
      });
      vi.mocked(login).mockResolvedValue({
        access_token: "tok",
        refresh_token: "ref",
        token_type: "bearer",
        expires_in: 3600,
      });

      const { useRegisterMutation } = await import("@/features/auth/queries");
      const { result } = renderHook(() => useRegisterMutation(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        result.current.mutate({
          username: "newuser",
          email: "a@b.com",
          password: "pass",
          name: "홍길동",
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(locationMock.href).toBe("/docs");
    });
  });
});
