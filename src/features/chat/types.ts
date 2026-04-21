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

export interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Source {
  file_id: string;
  filename: string;
  chunk_index?: number;
  page_number?: number | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  sources: Source[] | null;
  created_at: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}

export type SSEEventType = "token" | "sources" | "done" | "error";

export interface SSEEvent {
  type: SSEEventType;
  content: string | Source[];
}
