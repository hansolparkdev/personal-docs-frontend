import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

const mockRedirect = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

describe("Root page", () => {
  it("redirect를 '/docs'로 호출한다", async () => {
    const { default: Root } = await import("@/app/page");

    render(<Root />);

    expect(mockRedirect).toHaveBeenCalledWith("/docs");
  });
});
