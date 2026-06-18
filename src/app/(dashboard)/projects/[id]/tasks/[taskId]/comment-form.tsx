"use client";

import { useActionState } from "react";
import { addCommentAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Textarea, FieldError } from "@/components/ui/input";
import type { ActionResult } from "@/lib/types";

export function CommentForm({
  projectId,
  taskId,
}: {
  projectId: string;
  taskId: string;
}) {
  const [state, action, pending] = useActionState(
    addCommentAction.bind(null, projectId, taskId),
    { ok: false } as ActionResult,
  );

  return (
    <form action={action} className="space-y-2 border-t-2 border-paper pt-3">
      <Textarea name="body" rows={2} placeholder="添加评论…" />
      <FieldError>{state.errors?.body?.[0]}</FieldError>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "发送中…" : "发表评论"}
      </Button>
    </form>
  );
}
