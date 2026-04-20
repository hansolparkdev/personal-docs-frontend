"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
}

export function Composer({ value, onChange, onSend }: ComposerProps) {
  const isSendable = value.trim().length > 0;

  function handleSend() {
    if (!isSendable) return;
    onSend(value.trim());
    onChange("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-border bg-background px-4 py-3">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요..."
        className="min-h-[44px] max-h-[200px] resize-none flex-1"
        rows={1}
        aria-label="메시지 입력"
      />
      <Button
        type="button"
        size="icon"
        disabled={!isSendable}
        onClick={handleSend}
        aria-label="전송"
      >
        <Send className="size-4" />
      </Button>
    </div>
  );
}
