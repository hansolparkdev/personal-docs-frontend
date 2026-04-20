import { Badge } from "@/components/ui/badge";
import type { CitationSource } from "../types";

interface CitationChipProps {
  source: CitationSource;
}

export function CitationChip({ source }: CitationChipProps) {
  return (
    <Badge variant="outline" className="rounded-full text-xs font-normal">
      {source.doc} · {source.loc}
    </Badge>
  );
}
