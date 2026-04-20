import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Dropzone } from "@/features/docs/components/Dropzone";

describe("Dropzone", () => {
  it("안내 문구를 렌더링한다", () => {
    render(<Dropzone />);
    expect(
      screen.getByText("파일을 드래그하거나 클릭해 업로드하세요")
    ).toBeInTheDocument();
  });

  it("border-dashed 스타일 영역을 렌더링한다", () => {
    const { container } = render(<Dropzone />);
    const dropzone = container.querySelector(".border-dashed");
    expect(dropzone).toBeInTheDocument();
  });

  it("dragover 시 클래스가 변경된다", () => {
    const { container } = render(<Dropzone />);
    const dropzone = container.querySelector('[aria-label="파일 업로드 드롭존"]') as HTMLElement;

    // 초기 상태: dragover 클래스 없음
    expect(dropzone).not.toHaveClass("border-accent-foreground");

    // dragover 이벤트 발생
    fireEvent.dragOver(dropzone);

    // dragover 후: border-accent-foreground 클래스 추가됨
    expect(dropzone).toHaveClass("border-accent-foreground");
  });
});
