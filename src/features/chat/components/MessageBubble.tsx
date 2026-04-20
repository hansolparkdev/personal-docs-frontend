import { CitationChip } from "./CitationChip";
import type { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] space-y-2 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5"
            : "bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-2.5"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.sources.map((source, index) => (
              <CitationChip
                key={`${source.doc}-${source.loc}-${index}`}
                source={source}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
