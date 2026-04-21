import { create } from "zustand";
import type { Source } from "./types";

interface ChatStore {
  streamingSessionId: string | null; // 현재 스트리밍 중인 세션 ID
  streamingText: string;
  sources: Source[];
  isStreaming: boolean;
  appendToken: (token: string) => void;
  setSources: (sources: Source[]) => void;
  setStreaming: (v: boolean, sessionId?: string) => void;
  reset: () => void;
}

const initialState = {
  streamingSessionId: null as string | null,
  streamingText: "",
  sources: [] as Source[],
  isStreaming: false,
};

export const useChatStore = create<ChatStore>((set) => ({
  ...initialState,
  appendToken: (token: string) =>
    set((state) => ({ streamingText: state.streamingText + token })),
  setSources: (sources: Source[]) => set({ sources }),
  setStreaming: (v: boolean, sessionId?: string) =>
    set({ isStreaming: v, streamingSessionId: v ? (sessionId ?? null) : null }),
  reset: () => set(initialState),
}));
