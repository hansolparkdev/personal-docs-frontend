"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown } from "lucide-react";
import { MessageList } from "@/features/chat/components/MessageList";
import { ComposerWithRef, type ComposerRefHandle } from "@/features/chat/components/ComposerWithRef";
import { useSessionQuery } from "@/features/chat/queries";
import { useStreamMessage } from "@/features/chat/hooks/useStreamMessage";
import { useChatStore } from "@/features/chat/store";
import type { ChatMessage } from "@/features/chat/types";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const composerRef = useRef<ComposerRefHandle | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [pendingMessage, setPendingMessage] = useState<ChatMessage | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const isAtBottomRef = useRef(true);

  const { data: session } = useSessionQuery(sessionId);
  const { send } = useStreamMessage(sessionId);
  const { streamingText, sources, isStreaming: globalStreaming, streamingSessionId } = useChatStore();
  const isCurrentSessionStreaming = globalStreaming && streamingSessionId === sessionId;

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "instant" });
  }, []);

  // 스크롤 위치 감지
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      isAtBottomRef.current = distFromBottom < 80;
      setShowScrollBtn(distFromBottom > 80);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // 새 메시지/스트리밍 토큰 시 자동 스크롤 (사용자가 위로 올리지 않은 경우만)
  const serverMessages = session?.messages ?? [];
  const messages =
    pendingMessage && !serverMessages.some((m) => m.content === pendingMessage.content && m.role === "user")
      ? [...serverMessages, pendingMessage]
      : serverMessages;

  useEffect(() => {
    if (isAtBottomRef.current) scrollToBottom(false);
  }, [messages.length, streamingText, scrollToBottom]);

  async function handleSend(text: string) {
    if (!sessionId) return;
    setPendingMessage({
      id: `pending-${Date.now()}`,
      session_id: sessionId,
      role: "user",
      content: text,
      sources: null,
      created_at: new Date().toISOString(),
    });
    isAtBottomRef.current = true;
    scrollToBottom(false);
    try {
      await send(text);
    } finally {
      setPendingMessage(null);
    }
  }

  function handleExampleQuestion(question: string) {
    composerRef.current?.setValue(question);
  }

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
        <MessageList
          messages={messages}
          onExampleQuestion={handleExampleQuestion}
          isStreaming={isCurrentSessionStreaming}
          streamingText={isCurrentSessionStreaming ? streamingText : ""}
          streamingSources={isCurrentSessionStreaming ? sources : []}
        />
      </div>

      {/* 맨 아래로 버튼 */}
      {showScrollBtn && (
        <button
          type="button"
          onClick={() => scrollToBottom()}
          className="absolute bottom-24 right-6 z-10 flex size-8 items-center justify-center rounded-full border border-border bg-background shadow-md hover:bg-muted transition-colors"
          aria-label="맨 아래로"
        >
          <ArrowDown className="size-4 text-[var(--fg-2)]" />
        </button>
      )}

      <ComposerWithRef
        ref={composerRef}
        onSend={handleSend}
        disabled={isCurrentSessionStreaming || !sessionId}
      />
    </div>
  );
}
