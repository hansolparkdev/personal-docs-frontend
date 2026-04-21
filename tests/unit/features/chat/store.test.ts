import { describe, it, expect, beforeEach } from "vitest";
import { useChatStore } from "@/features/chat/store";
import type { Source } from "@/features/chat/types";

describe("useChatStore", () => {
  beforeEach(() => {
    // 각 테스트 전 스토어 초기화
    useChatStore.getState().reset();
  });

  it("초기 상태는 빈 문자열, 빈 배열, false이다", () => {
    const state = useChatStore.getState();
    expect(state.streamingText).toBe("");
    expect(state.sources).toEqual([]);
    expect(state.isStreaming).toBe(false);
  });

  it("appendToken은 streamingText에 토큰을 누적한다", () => {
    const { appendToken } = useChatStore.getState();
    appendToken("안녕");
    appendToken("하세요");
    expect(useChatStore.getState().streamingText).toBe("안녕하세요");
  });

  it("setSources는 sources를 설정한다", () => {
    const sources: Source[] = [
      { file_id: "f1", filename: "document.pdf", page: 1 },
    ];
    const { setSources } = useChatStore.getState();
    setSources(sources);
    expect(useChatStore.getState().sources).toEqual(sources);
  });

  it("setStreaming은 isStreaming을 설정한다", () => {
    const { setStreaming } = useChatStore.getState();
    setStreaming(true);
    expect(useChatStore.getState().isStreaming).toBe(true);
    setStreaming(false);
    expect(useChatStore.getState().isStreaming).toBe(false);
  });

  it("reset은 모든 상태를 초기값으로 되돌린다", () => {
    const { appendToken, setSources, setStreaming, reset } = useChatStore.getState();
    appendToken("텍스트");
    setSources([{ file_id: "f1", filename: "doc.pdf", page: 1 }]);
    setStreaming(true);

    reset();

    const state = useChatStore.getState();
    expect(state.streamingText).toBe("");
    expect(state.sources).toEqual([]);
    expect(state.isStreaming).toBe(false);
  });
});
