"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useUploadFileMutation } from "../queries";

const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".md", ".txt"];
const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/markdown",
  "text/plain",
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function validateFile(file: File): string | null {
  const fileName = file.name.toLowerCase();
  const isValidExt = SUPPORTED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  if (!isValidExt) {
    return `지원하지 않는 파일 형식입니다. (지원: PDF, DOCX, MD, TXT)`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `파일 크기가 50MB를 초과합니다.`;
  }
  return null;
}

export function Dropzone() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const uploadMutation = useUploadFileMutation();

  function handleFiles(files: File[]) {
    if (files.length === 0) return;
    const file = files[0];
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    uploadMutation.mutate(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }

  function handleClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.accept = SUPPORTED_EXTENSIONS.join(",");
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files ?? []);
      handleFiles(files);
    };
    input.click();
  }

  const isPending = uploadMutation.isPending;

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={isPending ? undefined : handleClick}
        onKeyDown={(e) => {
          if (!isPending && (e.key === "Enter" || e.key === " ")) handleClick();
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isPending
            ? "cursor-not-allowed opacity-60 border-border"
            : isDragOver
            ? "border-accent-foreground bg-accent cursor-pointer"
            : "border-border hover:border-ring hover:bg-muted cursor-pointer"
        }`}
        aria-label="파일 업로드 드롭존"
      >
        {isPending ? (
          <>
            <Loader2 className="size-8 text-[var(--fg-3)] animate-spin" />
            <p className="text-sm text-[var(--fg-2)]">업로드 중...</p>
          </>
        ) : (
          <>
            <Upload
              className={`size-8 ${isDragOver ? "text-accent-foreground" : "text-[var(--fg-3)]"}`}
            />
            <p className="text-sm text-[var(--fg-2)]">
              파일을 드래그하거나 클릭해 업로드하세요
            </p>
            <p className="text-xs text-[var(--fg-3)]">
              PDF, DOCX, MD, TXT 지원 · 최대 50MB
            </p>
          </>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
