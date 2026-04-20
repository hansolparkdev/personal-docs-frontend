import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WordMark } from "@/components/layout/WordMark";

describe("WordMark", () => {
  it("dot 요소와 텍스트 로고를 렌더링한다", () => {
    render(<WordMark />);
    expect(screen.getByTestId("wordmark-dot")).toBeInTheDocument();
    expect(screen.getByText("Personal Docs")).toBeInTheDocument();
  });

  it("size=sm 일 때 작은 클래스가 적용된다", () => {
    render(<WordMark size="sm" />);
    const dot = screen.getByTestId("wordmark-dot");
    expect(dot.className).toContain("w-[10px]");
  });

  it("size=lg 일 때 큰 클래스가 적용된다", () => {
    render(<WordMark size="lg" />);
    const dot = screen.getByTestId("wordmark-dot");
    expect(dot.className).toContain("w-[14px]");
  });

  it("기본 size 는 md 이다", () => {
    render(<WordMark />);
    const dot = screen.getByTestId("wordmark-dot");
    expect(dot.className).toContain("w-[12px]");
  });
});
