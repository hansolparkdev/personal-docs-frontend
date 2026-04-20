import { FileText, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Doc } from "../types";

interface DocRowProps {
  doc: Doc;
  onDelete: (id: string) => void;
}

export function DocRow({ doc, onDelete }: DocRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-muted transition-colors">
      <FileText className="size-5 shrink-0 text-[var(--fg-3)]" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{doc.name}</p>
        <p className="text-xs text-[var(--fg-3)]">
          {doc.size} · {doc.pages}페이지 · {doc.ago}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {doc.status === "ready" ? (
          <Badge variant="secondary">인덱싱 완료</Badge>
        ) : (
          <Badge variant="outline" className="gap-1.5">
            <span className="size-1.5 rounded-full bg-current animate-pulse" />
            처리 중
          </Badge>
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
