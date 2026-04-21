export const chatKeys = {
  all: () => ["chats"] as const,
  sessions: () => ["chats", "sessions"] as const,
  session: (sessionId: string | null) => ["chats", "session", sessionId] as const,
} as const;
