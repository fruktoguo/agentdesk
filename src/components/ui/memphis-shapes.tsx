import { cn } from "@/lib/utils";

/** 孟菲斯风格的浮动几何积木装饰（纯装饰，不响应交互） */
export function MemphisShapes({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden dark:opacity-70",
        className,
      )}
    >
      <div className="absolute -left-10 top-10 size-28 rotate-12 rounded-card border-2 border-ink bg-surface" />
      <div className="absolute right-[8%] top-[16%] size-16 rounded-full border-2 border-ink bg-accent float" />
      <div className="absolute bottom-[14%] left-[12%] size-14 border-2 border-ink bg-sky spin-slow" />
      <div
        className="absolute right-[20%] bottom-[22%] size-10 rounded-full border-2 border-ink bg-grass float"
        style={{ animationDelay: "1.2s" }}
      />
      <svg
        className="absolute left-[42%] top-[8%] size-16 text-ink"
        viewBox="0 0 40 40"
        fill="none"
      >
        <path
          d="M2 24 L10 8 L18 24 L26 8 L34 24"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="absolute right-[30%] top-[58%] size-12 text-ink"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="3" />
      </svg>
      <div className="absolute bottom-[6%] right-[8%] size-24 bg-dots opacity-20" />
    </div>
  );
}
