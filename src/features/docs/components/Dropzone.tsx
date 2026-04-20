"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

export function Dropzone() {
  const [isDragOver, setIsDragOver] = useState(false);

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
    // 목업: 실제 업로드 없음
    console.log("dropped files:", files.map((f) => f.name));
  }

  function handleClick() {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.doc,.docx,.txt";
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files ?? []);
      // 목업: 실제 업로드 없음
      console.log("selected files:", files.map((f) => f.name));
    };
    input.click();
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer ${
        isDragOver
          ? "border-accent-foreground bg-accent"
          : "border-border hover:border-ring hover:bg-muted"
      }`}
      aria-label="파일 업로드 드롭존"
    >
      <Upload
        className={`size-8 ${isDragOver ? "text-accent-foreground" : "text-[var(--fg-3)]"}`}
      />
      <p className="text-sm text-[var(--fg-2)]">
        파일을 드래그하거나 클릭해 업로드하세요
      </p>
      <p className="text-xs text-[var(--fg-3)]">
        PDF, DOC, DOCX, TXT 지원
      </p>
    </div>
  );
}
