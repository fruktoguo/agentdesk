"use client";

import { useActionState, useState } from "react";
import { createTaskAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import type { ActionResult } from "@/lib/types";

export function NewTaskForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    createTaskAction.bind(null, projectId),
    { ok: false } as ActionResult,
  );

  if (!open) {
    return <Button onClick={() => setOpen(true)}>＋ 新建任务</Button>;
  }

  return (
    <Card className="p-4">
      <form action={action} className="space-y-3">
        <div>
          <Label htmlFor="title">标题</Label>
          <Input id="title" name="title" placeholder="要 AI 做什么" autoFocus />
          <FieldError>{state.errors?.title?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor="desc">描述（可选）</Label>
          <Textarea
            id="desc"
            name="description"
            rows={2}
            placeholder="补充上下文、验收标准等"
          />
        </div>
        <div>
          <Label htmlFor="prio">优先级</Label>
          <select
            id="prio"
            name="priority"
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
            {pending ? "创建中…" : "创建任务"}
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
