"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { ActionResult } from "@/lib/types";
import { Button, type ButtonProps } from "./button";
import { ConfirmDialog } from "./dialog";
import { Alert } from "./alert";

type BtnVariant = ButtonProps["variant"];

interface DestructiveActionProps {
  /** 触发按钮文字 */
  label: string;
  /** 确认弹窗标题 */
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  /** 触发按钮样式（danger=破坏性，其余按需） */
  buttonVariant?: BtnVariant;
  buttonSize?: "sm" | "md";
  buttonClassName?: string;
  /** 已 bind 参数的 server action（无需 formData） */
  action: () => Promise<ActionResult>;
  /** 成功后的提示文案（会作为 toast/Alert 展示一瞬，可选） */
  successMessage?: string;
}

/**
 * 破坏性操作统一封装：触发按钮 → 确认弹窗（focus trap / Esc / 焦点回流）
 * → 表单提交（带 pending 禁用 + spinner）→ 成功关闭 / 失败在弹窗内提示。
 * 替代原生 window.confirm() + 裸 formAction（无反馈、可连点）。
 */
export function DestructiveAction({
  label,
  title,
  description,
  confirmLabel = "确认",
  buttonVariant = "danger",
  buttonSize = "sm",
  buttonClassName,
  action,
  successMessage,
}: DestructiveActionProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // 把无参 server action 适配成 useActionState 的 (prev, formData) 签名
  const [state, submit, pending] = useActionState(
    async (_prev: ActionResult): Promise<ActionResult> => action(),
    { ok: false },
  );

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state]);

  return (
    <>
      <Button
        type="button"
        variant={buttonVariant}
        size={buttonSize}
        className={buttonClassName}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>

      {/* 隐藏 form 承载 action，确认时 requestSubmit 触发，保留 form 语义 */}
      <form ref={formRef} action={submit} aria-hidden className="hidden" />

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        variant={buttonVariant === "danger" ? "danger" : "default"}
        pending={pending}
        onConfirm={() => formRef.current?.requestSubmit()}
      >
        {state.error && <Alert variant="error">{state.error}</Alert>}
        {state.ok && successMessage && (
          <Alert variant="success">{successMessage}</Alert>
        )}
      </ConfirmDialog>
    </>
  );
}
