import { describe, it, expect, vi } from "vitest";

const mockRedirect = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

describe("Root page", () => {
  it("redirect를 '/docs'로 호출한다", async () => {
    const { default: Root } = await import("@/app/page");
    // Root는 redirect를 호출하고 void를 반환하는 서버 함수
    Root();
    expect(mockRedirect).toHaveBeenCalledWith("/docs");
  });
});
