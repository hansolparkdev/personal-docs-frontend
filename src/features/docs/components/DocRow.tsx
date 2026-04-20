import { FileText, Trash2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDownloadUrl } from "../api";
import type { Doc } from "../types";

interface DocRowProps {
  doc: Doc;
  onDelete: (id: string) => void;
}

export function DocRow({ doc, onDelete }: DocRowProps) {
  async function handleDownload() {
    try {
      const { download_url } = await getDownloadUrl(doc.id);
      window.open(download_url, "_blank", "noopener,noreferrer");
    } catch {
      // 다운로드 URL 획득 실패 시 무시
    }
  }

  const isIndexed = doc.status === "indexed";
  const isProcessing = doc.status === "pending" || doc.status === "indexing";
  const isFailed = doc.status === "failed";
  const isUnsupported = doc.status === "unsupported";

  function StatusBadge() {
    if (isIndexed) return <Badge variant="secondary">인덱싱 완료</Badge>;
    if (isProcessing) return (
      <Badge variant="outline" className="gap-1.5">
        <span className="size-1.5 rounded-full bg-current animate-pulse" />
        {doc.status === "pending" ? "업로드됨" : "처리 중..."}
      </Badge>
    );
    if (isFailed) return <Badge variant="destructive">처리 실패</Badge>;
    if (isUnsupported) return <Badge variant="outline">미지원 형식</Badge>;
    return null;
  }

  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-muted transition-colors">
      <FileText className="size-5 shrink-0 text-[var(--fg-3)]" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{doc.name}</p>
        <p className="text-xs text-[var(--fg-3)]">
          {doc.size}
          {doc.pages !== undefined && ` · ${doc.pages}페이지`}
          {" · "}
          {doc.ago}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge />

        {isIndexed && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDownload}
            aria-label={`${doc.name} 다운로드`}
          >
            <Download className="size-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(doc.id)}
          aria-label={`${doc.name} 삭제`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
