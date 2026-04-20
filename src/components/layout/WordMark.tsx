type WordMarkSize = "sm" | "md" | "lg";

interface WordMarkProps {
  size?: WordMarkSize;
}

const sizeConfig: Record<
  WordMarkSize,
  { dotSize: string; dotRadius: string; textClass: string }
> = {
  sm: {
    dotSize: "w-[10px] h-[10px]",
    dotRadius: "rounded-[3px]",
    textClass: "text-[15px]",
  },
  md: {
    dotSize: "w-[12px] h-[12px]",
    dotRadius: "rounded-[3.5px]",
    textClass: "text-[17px]",
  },
  lg: {
    dotSize: "w-[14px] h-[14px]",
    dotRadius: "rounded-[4px]",
    textClass: "text-[20px]",
  },
};

export function WordMark({ size = "md" }: WordMarkProps) {
  const config = sizeConfig[size];

  return (
    <div className="flex items-center gap-2">
      <div
        data-testid="wordmark-dot"
        className={`${config.dotSize} ${config.dotRadius} bg-foreground shrink-0`}
      />
      <span
        className={`${config.textClass} font-semibold tracking-[-0.01em] text-foreground`}
      >
        Personal Docs
      </span>
    </div>
  );
}
