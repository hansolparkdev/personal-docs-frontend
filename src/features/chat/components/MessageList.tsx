"use client";

import { MessageSquare, Bot, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage, Source } from "../types";

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  if (isToday) return `${h}:${m}`;
  const mo = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${mo}/${day} ${h}:${m}`;
}

const EXAMPLE_QUESTIONS = [
  "프로젝트 기획서의 핵심 목표가 무엇인가요?",
  "API 설계 문서에서 인증 방식을 설명해 주세요",
  "최근 회의록에서 결정된 사항을 요약해 주세요",
];

interface MessageListProps {
  messages: ChatMessage[];
  onExampleQuestion?: (question: string) => void;
  isStreaming?: boolean;
  streamingText?: string;
  streamingSources?: Source[];
}

export function MessageList({
  messages,
  onExampleQuestion,
  isStreaming,
  streamingText,
  streamingSources,
}: MessageListProps) {
  if (messages.length === 0 && !isStreaming) {
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
        <ChatMessageBubble key={message.id} message={message} />
      ))}
      {isStreaming && (
        <div className="flex items-end gap-2 justify-start">
          <div className="shrink-0 size-7 rounded-full bg-muted flex items-center justify-center mb-0">
            <Bot className="size-4 text-[var(--fg-2)]" />
          </div>
          <div className="max-w-[70%] space-y-2 bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-2.5">
            {streamingText ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {streamingText}
              </p>
            ) : (
              <span className="text-sm text-[var(--fg-3)] animate-pulse">
                AI가 응답 중이에요...
              </span>
            )}
            {streamingSources && streamingSources.filter(s => s.filename).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {streamingSources.filter(s => s.filename).map((source, index) => (
                  <Badge
                    key={`${source.file_id}-${index}`}
                    variant="outline"
                    className="rounded-full text-xs font-normal"
                  >
                    {source.filename}{source.page_number != null ? ` · p.${source.page_number}` : ""}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isPending = message.id.startsWith("pending-");

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="shrink-0 size-7 rounded-full bg-muted flex items-center justify-center mb-4">
          <Bot className="size-4 text-[var(--fg-2)]" />
        </div>
      )}
      <div className={`flex flex-col gap-1 max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`space-y-2 ${
            isUser
              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5"
              : "bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-2.5"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          {!isUser && message.sources && message.sources.filter(s => s.filename).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {message.sources.filter(s => s.filename).map((source, index) => (
                <Badge
                  key={`${source.file_id}-${index}`}
                  variant="outline"
                  className="rounded-full text-xs font-normal"
                >
                  {source.filename}{source.page_number != null ? ` · p.${source.page_number}` : ""}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {!isPending && (
          <span className="text-[10px] text-[var(--fg-4)] px-1">
            {formatTime(message.created_at)}
          </span>
        )}
      </div>
      {isUser && (
        <div className="shrink-0 size-7 rounded-full bg-primary flex items-center justify-center mb-4">
          <User className="size-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}
