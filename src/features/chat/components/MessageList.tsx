"use client";

import { MessageSquare } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "../types";

const EXAMPLE_QUESTIONS = [
  "프로젝트 기획서의 핵심 목표가 무엇인가요?",
  "API 설계 문서에서 인증 방식을 설명해 주세요",
  "최근 회의록에서 결정된 사항을 요약해 주세요",
];

interface MessageListProps {
  messages: Message[];
  onExampleQuestion?: (question: string) => void;
  isPending?: boolean;
}

export function MessageList({ messages, onExampleQuestion, isPending }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 py-16 text-center">
        <MessageSquare className="size-12 text-[var(--fg-4)]" />
        <div className="space-y-1">
          <p className="text-base font-medium">대화를 시작해 보세요</p>
          <p className="text-sm text-[var(--fg-3)]">
            업로드한 문서에 대해 무엇이든 물어보세요
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {EXAMPLE_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => onExampleQuestion?.(question)}
              className="text-sm text-left text-[var(--fg-2)] border border-border rounded-lg px-4 py-2.5 hover:bg-muted transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 px-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isPending && (
        <div className="flex gap-2 items-center text-sm text-[var(--fg-3)] px-2">
          <span className="animate-pulse">AI가 응답 중이에요...</span>
        </div>
      )}
    </div>
  );
}
