export const fileKeys = {
  all: () => ["files"] as const,
  list: () => ["files", "list"] as const,
  detail: (fileId: string) => ["files", "detail", fileId] as const,
} as const;
