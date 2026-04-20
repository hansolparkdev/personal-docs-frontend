import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocRow } from "@/features/docs/components/DocRow";
import type { Doc } from "@/features/docs/types";

const baseDoc: Doc = {
  id: "doc-1",
  name: "프로젝트기획서.pdf",
  size: "2.4MB",
  pages: 12,
  ago: "2시간 전",
  status: "ready",
};

describe("DocRow", () => {
  it("파일명, 크기, 페이지 수를 렌더링한다", () => {
    render(<DocRow doc={baseDoc} onDelete={vi.fn()} />);
    expect(screen.getByText("프로젝트기획서.pdf")).toBeInTheDocument();
    expect(screen.getByText(/2\.4MB/)).toBeInTheDocument();
    expect(screen.getByText(/12페이지/)).toBeInTheDocument();
  });

  it("status 'ready' → '인덱싱 완료' 배지를 표시한다", () => {
    render(<DocRow doc={baseDoc} onDelete={vi.fn()} />);
    expect(screen.getByText("인덱싱 완료")).toBeInTheDocument();
  });

  it("status 'indexing' → '처리 중' 배지를 표시한다", () => {
    const indexingDoc: Doc = { ...baseDoc, status: "indexing" };
    render(<DocRow doc={indexingDoc} onDelete={vi.fn()} />);
    expect(screen.getByText("처리 중")).toBeInTheDocument();
  });

  it("삭제 버튼 클릭 → onDelete 콜백이 doc.id와 함께 호출된다", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<DocRow doc={baseDoc} onDelete={onDelete} />);
    await user.click(screen.getByRole("button", { name: /삭제/ }));
    expect(onDelete).toHaveBeenCalledWith("doc-1");
  });
});
