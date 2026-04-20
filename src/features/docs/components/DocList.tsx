"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { DocRow } from "./DocRow";
import type { Doc } from "../types";

interface DocListProps {
  initialDocs: Doc[];
}

export function DocList({ initialDocs }: DocListProps) {
  const [docs, setDocs] = useState<Doc[]>(initialDocs);

  function handleDelete(id: string) {
    setDocs((prev) => prev.filter((doc) => doc.id !== id));
  }

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <FileText className="size-10 text-[var(--fg-4)]" />
        <p className="text-sm text-[var(--fg-3)]">업로드된 문서가 없어요</p>
        <p className="text-xs text-[var(--fg-4)]">
          위의 드롭존에서 파일을 업로드하세요
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
      {docs.map((doc) => (
        <DocRow key={doc.id} doc={doc} onDelete={handleDelete} />
      ))}
    </div>
  );
}
