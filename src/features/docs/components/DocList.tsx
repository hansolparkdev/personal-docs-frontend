"use client";

import { FileText, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DocRow } from "./DocRow";
import { useFilesQuery, useDeleteFileMutation } from "../queries";
import type { FileListItem } from "../types";

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${bytes} B`;
}

function formatAgo(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${diffDays}일 전`;
}

function fileItemToDoc(item: FileListItem) {
  return {
    id: item.file_id,
    name: item.filename,
    size: formatFileSize(item.size_bytes),
    ago: formatAgo(item.created_at),
    status: item.index_status,
  };
}

export function DocList() {
  const { data: files, isLoading, isError } = useFilesQuery();
  const deleteMutation = useDeleteFileMutation();

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-destructive py-6">
        <AlertCircle className="size-5" />
        <p className="text-sm">파일 목록을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  if (!files || files.length === 0) {
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
      {files.map((file) => {
        const doc = fileItemToDoc(file);
        return (
          <DocRow
            key={file.file_id}
            doc={doc}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        );
      })}
    </div>
  );
}
