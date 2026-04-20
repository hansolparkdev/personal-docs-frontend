import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const mockDeleteMutate = vi.fn();

// vi.mock must use factory that captures from closures - use module-level state
let _mockFilesData: unknown[] | undefined = [
  {
    id: "1",
    filename: "프로젝트 기획서.pdf",
    size: 2516582,
    pages: 32,
    created_at: "2026-01-01",
    status: "ready",
  },
  {
    id: "2",
    filename: "API 설계 문서.pdf",
    size: 1153433,
    pages: 18,
    created_at: "2026-01-05",
    status: "ready",
  },
  {
    id: "3",
    filename: "회의록.pdf",
    size: 524288,
    pages: 8,
    created_at: "2026-04-20",
    status: "indexing",
  },
  {
    id: "4",
    filename: "기술 스펙 v2.pdf",
    size: 3881164,
    pages: 56,
    created_at: "2026-04-20",
    status: "indexing",
  },
];
let _mockIsLoading = false;
let _mockIsError = false;

vi.mock("@/features/docs/queries", () => ({
  useFilesQuery: vi.fn(() => ({
    data: _mockFilesData,
    isLoading: _mockIsLoading,
    isError: _mockIsError,
  })),
  useDeleteFileMutation: vi.fn(() => ({
    mutate: mockDeleteMutate,
    isPending: false,
  })),
  useFileQuery: vi.fn(() => ({
    data: null,
    isLoading: false,
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

import { DocList } from "@/features/docs/components/DocList";

describe("DocList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _mockFilesData = [
      {
        id: "1",
        filename: "프로젝트 기획서.pdf",
        size: 2516582,
        pages: 32,
        created_at: "2026-01-01",
        status: "ready",
      },
      {
        id: "2",
        filename: "API 설계 문서.pdf",
        size: 1153433,
        pages: 18,
        created_at: "2026-01-05",
        status: "ready",
      },
      {
        id: "3",
        filename: "회의록.pdf",
        size: 524288,
        pages: 8,
        created_at: "2026-04-20",
        status: "indexing",
      },
      {
        id: "4",
        filename: "기술 스펙 v2.pdf",
        size: 3881164,
        pages: 56,
        created_at: "2026-04-20",
        status: "indexing",
      },
    ];
    _mockIsLoading = false;
    _mockIsError = false;
  });

  it("파일 목록 4개를 렌더링한다", () => {
    render(<DocList />, { wrapper: createWrapper() });
    expect(screen.getByText("프로젝트 기획서.pdf")).toBeInTheDocument();
    expect(screen.getByText("API 설계 문서.pdf")).toBeInTheDocument();
    expect(screen.getByText("회의록.pdf")).toBeInTheDocument();
    expect(screen.getByText("기술 스펙 v2.pdf")).toBeInTheDocument();
  });

  it('ready 상태 → "인덱싱 완료" 배지를 표시한다', () => {
    render(<DocList />, { wrapper: createWrapper() });
    const badges = screen.getAllByText("인덱싱 완료");
    expect(badges.length).toBeGreaterThan(0);
  });

  it('indexing 상태 → "처리 중" 배지를 표시한다', () => {
    render(<DocList />, { wrapper: createWrapper() });
    const badges = screen.getAllByText("처리 중");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("삭제 버튼 클릭 시 useDeleteFileMutation.mutate를 호출한다", async () => {
    const user = userEvent.setup();
    render(<DocList />, { wrapper: createWrapper() });
    const deleteBtn = screen.getByRole("button", { name: "프로젝트 기획서.pdf 삭제" });
    await user.click(deleteBtn);
    expect(mockDeleteMutate).toHaveBeenCalledWith("1");
  });

  it("로딩 상태일 때 스켈레톤을 표시한다", () => {
    _mockIsLoading = true;
    _mockFilesData = undefined;
    render(<DocList />, { wrapper: createWrapper() });
    // animate-pulse 클래스가 있는 요소 확인
    const { container } = render(<DocList />, { wrapper: createWrapper() });
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("빈 목록일 때 빈 상태 메시지를 표시한다", () => {
    _mockFilesData = [];
    render(<DocList />, { wrapper: createWrapper() });
    expect(screen.getByText("업로드된 문서가 없어요")).toBeInTheDocument();
  });

  it("에러 상태일 때 에러 메시지를 표시한다", () => {
    _mockIsError = true;
    _mockFilesData = undefined;
    render(<DocList />, { wrapper: createWrapper() });
    expect(screen.getByText(/파일 목록을 불러오는 중 오류/)).toBeInTheDocument();
  });
});
