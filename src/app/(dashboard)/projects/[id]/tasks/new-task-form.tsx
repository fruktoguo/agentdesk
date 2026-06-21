"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { createTaskAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/feedback";
import { Alert } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import type { ActionResult } from "@/lib/types";

export function NewTaskForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    createTaskAction.bind(null, projectId),
    { ok: false } as ActionResult,
  );

  // 成功后收起并清空，防止重复提交同名任务
  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      formRef.current?.reset();
    }
  }, [state]);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Icon icon={Plus} size={16} />
        新建任务
      </Button>
    );
  }

  return (
    <Card className="p-4">
      <form ref={formRef} action={action} className="space-y-3">
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
          <Select id="prio" name="priority" defaultValue="">
            <option value="">中等（默认）</option>
            <option value="LOW">低</option>
            <option value="HIGH">高</option>
            <option value="URGENT">紧急</option>
          </Select>
        </div>
        {state.error && <Alert variant="error">{state.error}</Alert>}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending && <Spinner className="size-4 border-[3px]" />}
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
