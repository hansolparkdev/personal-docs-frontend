export interface CitationSource {
  doc: string;
  loc: string;
}

export interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  sources?: CitationSource[];
}
