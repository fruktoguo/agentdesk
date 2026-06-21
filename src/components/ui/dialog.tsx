"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";
import { Spinner } from "./feedback";

type Variant = "default" | "danger";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: Variant;
  pending?: boolean;
  /** 可放置隐藏字段 <form>，配合 onConfirm 触发 requestSubmit */
  children?: React.ReactNode;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function focusables(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
}

/**
 * 主题化确认对话框，替代原生 window.confirm()。
 * - 焦点陷阱：Tab 在面板内循环
 * - Esc 关闭（pending 时禁用，防误触中断）
 * - 关闭后焦点回流到触发元素
 * - role=dialog + aria-modal，屏幕阅读器可达
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "确认",
  cancelLabel = "取消",
  onConfirm,
  variant = "default",
  pending = false,
  children,
}: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // 聚焦首个可交互元素
    const panel = panelRef.current;
    focusables(panel ?? document.body)[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (pending) return;
        e.preventDefault();
        onOpenChange(false);
        return;
      }
      if (e.key === "Tab" && panel) {
        const items = focusables(panel);
        if (items.length === 0) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // 锁背景滚动

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.(); // 焦点回流
    };
  }, [open, onOpenChange, pending]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/60"
        onClick={() => !pending && onOpenChange(false)}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative z-10 w-full max-w-md rounded-card border-2 border-ink bg-bg p-5 shadow-hard-xl toast-in"
      >
        <h2 id="confirm-title" className="heading text-xl">
          {title}
        </h2>
        {description && (
          <div className="mt-2 text-sm font-medium text-muted">
            {description}
          </div>
        )}
        {children && <div className="mt-3">{children}</div>}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending && <Spinner className="size-4 border-[3px]" />}
            {pending ? "处理中…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
