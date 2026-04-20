import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { DocList } from "@/features/docs/components/DocList";
import type { Doc } from "../types";

const MOCK_DOCS: Doc[] = [
  {
    id: "1",
    name: "프로젝트 기획서.pdf",
    size: "2.4 MB",
    pages: 32,
    ago: "2일 전",
    status: "ready",
  },
  {
    id: "2",
    name: "API 설계 문서.pdf",
    size: "1.1 MB",
    pages: 18,
    ago: "5일 전",
    status: "indexing",
  },
  {
    id: "3",
    name: "회의록.pdf",
    size: "512 KB",
    pages: 8,
    ago: "1시간 전",
    status: "ready",
  },
  {
    id: "4",
    name: "기술 스펙 v2.pdf",
    size: "3.7 MB",
    pages: 56,
    ago: "방금 전",
    status: "indexing",
  },
];

describe("DocList", () => {
  it("목업 문서 4개를 렌더링한다", () => {
    render(<DocList initialDocs={MOCK_DOCS} />);
    expect(screen.getByText("프로젝트 기획서.pdf")).toBeInTheDocument();
    expect(screen.getByText("API 설계 문서.pdf")).toBeInTheDocument();
    expect(screen.getByText("회의록.pdf")).toBeInTheDocument();
    expect(screen.getByText("기술 스펙 v2.pdf")).toBeInTheDocument();
  });

  it("파일 크기를 렌더링한다", () => {
    render(<DocList initialDocs={MOCK_DOCS} />);
    expect(screen.getByText(/2\.4 MB/)).toBeInTheDocument();
  });

  it('ready 상태 → "인덱싱 완료" secondary 배지를 표시한다', () => {
    render(<DocList initialDocs={MOCK_DOCS} />);
    const badges = screen.getAllByText("인덱싱 완료");
    expect(badges.length).toBeGreaterThan(0);
  });

  it('indexing 상태 → "처리 중" outline 배지를 표시한다', () => {
    render(<DocList initialDocs={MOCK_DOCS} />);
    const badges = screen.getAllByText("처리 중");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("삭제 버튼 클릭 시 해당 항목을 제거한다", async () => {
    const user = userEvent.setup();
    render(<DocList initialDocs={MOCK_DOCS} />);
    const deleteBtn = screen.getByRole("button", { name: "프로젝트 기획서.pdf 삭제" });
    await user.click(deleteBtn);
    expect(screen.queryByText("프로젝트 기획서.pdf")).not.toBeInTheDocument();
  });

  it("전체 삭제 시 빈 상태를 표시한다", async () => {
    const user = userEvent.setup();
    const singleDoc: Doc[] = [
      {
        id: "1",
        name: "단일 문서.pdf",
        size: "1 MB",
        pages: 5,
        ago: "방금 전",
        status: "ready",
      },
    ];
    render(<DocList initialDocs={singleDoc} />);
    await user.click(screen.getByRole("button", { name: "단일 문서.pdf 삭제" }));
    expect(screen.getByText("업로드된 문서가 없어요")).toBeInTheDocument();
  });

  it("빈 docs 배열 시 빈 상태를 표시한다", () => {
    render(<DocList initialDocs={[]} />);
    expect(screen.getByText("업로드된 문서가 없어요")).toBeInTheDocument();
  });
});
