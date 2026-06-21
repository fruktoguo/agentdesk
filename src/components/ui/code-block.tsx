"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

/**
 * 统一代码块：孟菲斯硬边 + 黑底亮字 + 一键复制。
 * 替代各处手写的 <pre><code>（样式不一致、无复制）。
 */
export function CodeBlock({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 剪贴板不可用时静默失败 */
    }
  };

  return (
    <div className={cn("relative", className)}>
      <pre className="overflow-x-auto rounded-input border-2 border-ink bg-ink p-4 pr-12 font-mono text-xs text-surface">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "已复制" : "复制到剪贴板"}
        className="pressable absolute right-2 top-2 flex size-8 items-center justify-center rounded-btn border-2 border-ink bg-surface text-ink"
      >
        <Icon icon={copied ? Check : Copy} size={16} />
      </button>
    </div>
  );
}
