export type DocStatus = "ready" | "indexing";

export interface Doc {
  id: string;
  name: string;
  size: string;
  pages: number;
  ago: string;
  status: DocStatus;
}
