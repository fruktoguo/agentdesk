"use client";

import { useActionState, useEffect, useRef } from "react";
import { addCommentAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Textarea, Label, FieldError } from "@/components/ui/input";
import { Spinner } from "@/components/ui/feedback";
import type { ActionResult } from "@/lib/types";

export function CommentForm({
  projectId,
  taskId,
}: {
  projectId: string;
  taskId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    addCommentAction.bind(null, projectId, taskId),
    { ok: false } as ActionResult,
  );

  // 发表成功后清空评论框
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="space-y-2 border-t-2 border-paper pt-3"
    >
      <Label htmlFor={`comment-${taskId}`}>添加评论</Label>
      <Textarea
        id={`comment-${taskId}`}
        name="body"
        rows={2}
        placeholder="写下你的评论…"
      />
      <FieldError>{state.errors?.body?.[0]}</FieldError>
      <Button type="submit" size="sm" disabled={pending}>
        {pending && <Spinner className="size-4 border-[3px]" />}
        {pending ? "发送中…" : "发表评论"}
      </Button>
    </form>
  );
}
