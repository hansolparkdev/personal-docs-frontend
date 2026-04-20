"use client";

import { useState, useRef } from "react";
import { MessageList } from "@/features/chat/components/MessageList";
import { ComposerWithRef, type ComposerRefHandle } from "@/features/chat/components/ComposerWithRef";
import { SEED_MESSAGES } from "@/features/chat/mock-data";
import type { Message } from "@/features/chat/types";

const AI_DUMMY_RESPONSES = [
  "문서를 분석해 보겠습니다. 해당 내용은 업로드된 문서에서 확인할 수 있습니다.",
  "좋은 질문이에요. 관련 내용을 문서에서 찾아봤습니다.",
  "문서 내용에 따르면, 요청하신 정보를 아래와 같이 요약할 수 있어요.",
];

let messageIdCounter = 100;

function generateId() {
  return String(++messageIdCounter);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [isAiPending, setIsAiPending] = useState(false);
  const composerRef = useRef<ComposerRefHandle | null>(null);

  function handleSend(text: string) {
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsAiPending(true);

    // 목업 AI 응답: 실제 API 연동 없이 700ms 딜레이 시뮬레이션
    const timer = setTimeout(() => {
      const aiMessage: Message = {
        id: generateId(),
        role: "ai",
        text: AI_DUMMY_RESPONSES[
          Math.floor(Math.random() * AI_DUMMY_RESPONSES.length)
        ],
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsAiPending(false);
    }, 700);

    return () => clearTimeout(timer);
  }

  function handleExampleQuestion(question: string) {
    composerRef.current?.setValue(question);
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-6 py-2 bg-muted/50 border-b border-border text-xs text-[var(--fg-3)] text-center">
        챗 기능은 준비 중이에요. 현재는 목업 응답으로 동작합니다.
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <MessageList
          messages={messages}
          onExampleQuestion={handleExampleQuestion}
          isPending={isAiPending}
        />
      </div>
      <ComposerWithRef ref={composerRef} onSend={handleSend} disabled={isAiPending} />
    </div>
  );
}
