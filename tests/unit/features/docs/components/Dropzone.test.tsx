import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const mockUploadMutate = vi.fn();
let _mockIsPending = false;

vi.mock("@/features/docs/queries", () => ({
  useUploadFileMutation: vi.fn(() => ({
    mutate: mockUploadMutate,
    isPending: _mockIsPending,
  })),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

import { Dropzone } from "@/features/docs/components/Dropzone";

describe("Dropzone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _mockIsPending = false;
  });

  it("안내 문구를 렌더링한다", () => {
    render(<Dropzone />, { wrapper: createWrapper() });
    expect(
      screen.getByText("파일을 드래그하거나 클릭해 업로드하세요")
    ).toBeInTheDocument();
  });

  it("border-dashed 스타일 영역을 렌더링한다", () => {
    const { container } = render(<Dropzone />, { wrapper: createWrapper() });
    const dropzone = container.querySelector(".border-dashed");
    expect(dropzone).toBeInTheDocument();
  });

  it("dragover 시 클래스가 변경된다", () => {
    const { container } = render(<Dropzone />, { wrapper: createWrapper() });
    const dropzone = container.querySelector('[aria-label="파일 업로드 드롭존"]') as HTMLElement;

    expect(dropzone).not.toHaveClass("border-accent-foreground");
    fireEvent.dragOver(dropzone);
    expect(dropzone).toHaveClass("border-accent-foreground");
  });

  it("지원 확장자 외 파일 드롭 시 에러 메시지를 표시한다", async () => {
    const { container } = render(<Dropzone />, { wrapper: createWrapper() });
    const dropzone = container.querySelector('[aria-label="파일 업로드 드롭존"]') as HTMLElement;

    const unsupportedFile = new File(["content"], "test.exe", { type: "application/octet-stream" });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [unsupportedFile],
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/지원하지 않는 파일 형식/)).toBeInTheDocument();
    });
    expect(mockUploadMutate).not.toHaveBeenCalled();
  });

  it("50MB 초과 파일 드롭 시 에러 메시지를 표시한다", async () => {
    const { container } = render(<Dropzone />, { wrapper: createWrapper() });
    const dropzone = container.querySelector('[aria-label="파일 업로드 드롭존"]') as HTMLElement;

    const largeFile = new File(["x".repeat(10)], "large.pdf", { type: "application/pdf" });
    Object.defineProperty(largeFile, "size", { value: 51 * 1024 * 1024 });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [largeFile],
      },
    });

    await waitFor(() => {
      expect(screen.getByText("파일 크기가 50MB를 초과합니다.")).toBeInTheDocument();
    });
    expect(mockUploadMutate).not.toHaveBeenCalled();
  });

  it("유효한 파일 드롭 시 uploadFile mutation을 호출한다", async () => {
    const { container } = render(<Dropzone />, { wrapper: createWrapper() });
    const dropzone = container.querySelector('[aria-label="파일 업로드 드롭존"]') as HTMLElement;

    const validFile = new File(["content"], "test.pdf", { type: "application/pdf" });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [validFile],
      },
    });

    await waitFor(() => {
      expect(mockUploadMutate).toHaveBeenCalledWith(validFile);
    });
  });

  it("업로드 중에는 로딩 표시를 보여준다", () => {
    _mockIsPending = true;
    render(<Dropzone />, { wrapper: createWrapper() });
    expect(screen.getByText("업로드 중...")).toBeInTheDocument();
  });

  it("지원 확장자 안내 문구에 pdf, docx, md, txt가 포함된다", () => {
    render(<Dropzone />, { wrapper: createWrapper() });
    const text = screen.getByText(/PDF.*DOCX.*MD.*TXT/i);
    expect(text).toBeInTheDocument();
  });
});
