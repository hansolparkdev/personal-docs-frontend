import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

vi.mock("@/features/docs/api", () => ({
  getDownloadUrl: vi.fn(),
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

import { DocRow } from "@/features/docs/components/DocRow";
import type { Doc } from "@/features/docs/types";

const baseDoc: Doc = {
  id: "doc-1",
  name: "프로젝트기획서.pdf",
  size: "2.4MB",
  pages: 12,
  ago: "2시간 전",
  status: "indexed",
};

describe("DocRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("파일명, 크기, 페이지 수를 렌더링한다", () => {
    render(<DocRow doc={baseDoc} onDelete={vi.fn()} />, { wrapper: createWrapper() });
    expect(screen.getByText("프로젝트기획서.pdf")).toBeInTheDocument();
    expect(screen.getByText(/2\.4MB/)).toBeInTheDocument();
    expect(screen.getByText(/12페이지/)).toBeInTheDocument();
  });

  it("status 'ready' → '인덱싱 완료' 배지를 표시한다", () => {
    render(<DocRow doc={baseDoc} onDelete={vi.fn()} />, { wrapper: createWrapper() });
    expect(screen.getByText("인덱싱 완료")).toBeInTheDocument();
  });

  it("status 'indexing' → '처리 중' 배지를 표시한다", () => {
    const indexingDoc: Doc = { ...baseDoc, status: "indexing" };
    render(<DocRow doc={indexingDoc} onDelete={vi.fn()} />, { wrapper: createWrapper() });
    expect(screen.getByText(/처리 중/)).toBeInTheDocument();
  });

  it("삭제 버튼 클릭 → onDelete 콜백이 doc.id와 함께 호출된다", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<DocRow doc={baseDoc} onDelete={onDelete} />, { wrapper: createWrapper() });
    await user.click(screen.getByRole("button", { name: /삭제/ }));
    expect(onDelete).toHaveBeenCalledWith("doc-1");
  });

  it("ready 상태에서 다운로드 버튼이 표시된다", () => {
    render(<DocRow doc={baseDoc} onDelete={vi.fn()} />, { wrapper: createWrapper() });
    expect(screen.getByRole("button", { name: "프로젝트기획서.pdf 다운로드" })).toBeInTheDocument();
  });

  it("다운로드 버튼 클릭 시 getDownloadUrl을 호출한다", async () => {
    const { getDownloadUrl } = await import("@/features/docs/api");
    vi.mocked(getDownloadUrl).mockResolvedValue({ download_url: "https://presigned.url/file.pdf", expires_in: 3600 });

    const user = userEvent.setup();
    render(<DocRow doc={baseDoc} onDelete={vi.fn()} />, { wrapper: createWrapper() });

    await user.click(screen.getByRole("button", { name: "프로젝트기획서.pdf 다운로드" }));
    expect(getDownloadUrl).toHaveBeenCalledWith("doc-1");
  });

  it("indexing 상태에서는 다운로드 버튼이 없거나 비활성화된다", () => {
    const indexingDoc: Doc = { ...baseDoc, status: "indexing" };
    render(<DocRow doc={indexingDoc} onDelete={vi.fn()} />, { wrapper: createWrapper() });
    const downloadBtn = screen.queryByRole("button", { name: "프로젝트기획서.pdf 다운로드" });
    if (downloadBtn) {
      expect(downloadBtn).toBeDisabled();
    } else {
      expect(downloadBtn).toBeNull();
    }
  });
});
