"use client";

import { useActionState, useState } from "react";
import { createIssueAction } from "@/app/actions/issues";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import type { ActionResult } from "@/lib/types";

export function IssueForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    createIssueAction.bind(null, projectId),
    { ok: false } as ActionResult,
  );

  if (!open) {
    return <Button onClick={() => setOpen(true)}>＋ 记录问题</Button>;
  }

  return (
    <Card className="p-4">
      <form action={action} className="space-y-3">
        <div>
          <Label htmlFor="ititle">标题</Label>
          <Input id="ititle" name="title" placeholder="问题描述" autoFocus />
          <FieldError>{state.errors?.title?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor="idesc">描述（可选）</Label>
          <Textarea id="idesc" name="description" rows={2} />
        </div>
        <div>
          <Label htmlFor="isev">严重程度</Label>
          <select
            id="isev"
            name="severity"
            defaultValue=""
            className="w-full rounded-input border-2 border-ink bg-bg px-3 py-2.5 text-sm font-bold shadow-hard-sm outline-none"
          >
            <option value="">中等（默认）</option>
            <option value="LOW">低</option>
            <option value="HIGH">高</option>
            <option value="URGENT">紧急</option>
          </select>
        </div>
        {state.error && (
          <p className="text-sm font-bold text-accent">{state.error}</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "记录中…" : "记录问题"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            取消
          </Button>
        </div>
      </form>
    </Card>
  );
}
