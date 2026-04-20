"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ComposerRefHandle {
  setValue: (v: string) => void;
}

interface ComposerWithRefProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const ComposerWithRef = forwardRef<ComposerRefHandle, ComposerWithRefProps>(
  function ComposerWithRef({ onSend, disabled = false }, ref) {
    const [text, setText] = useState("");

    useImperativeHandle(ref, () => ({
      setValue: (v: string) => setText(v),
    }));

    const isSendable = text.trim().length > 0 && !disabled;

    function handleSend() {
      if (!isSendable) return;
      onSend(text.trim());
      setText("");
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }

    return (
      <div className="border-t border-border bg-background px-4 py-3">
        <div className="flex items-center gap-2 bg-background border border-border rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-ring/30 focus-within:border-ring transition-shadow">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            className="min-h-[36px] max-h-[200px] resize-none flex-1 border-0 shadow-none focus-visible:ring-0 p-0 text-sm"
            rows={1}
            aria-label="메시지 입력"
            disabled={disabled}
          />
          <Button
            type="button"
            size="icon"
            disabled={!isSendable}
            onClick={handleSend}
            aria-label="전송"
            className="shrink-0 size-8 rounded-full cursor-pointer"
          >
            <Send className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-[var(--fg-3)] text-center mt-2 font-mono">Enter 로 전송 · Shift + Enter 로 줄바꿈</p>
      </div>
    );
  }
);
