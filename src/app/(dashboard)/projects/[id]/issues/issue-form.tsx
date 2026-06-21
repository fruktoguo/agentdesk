"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { createIssueAction } from "@/app/actions/issues";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/feedback";
import { Alert } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import type { ActionResult } from "@/lib/types";

export function IssueForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    createIssueAction.bind(null, projectId),
    { ok: false } as ActionResult,
  );

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
        记录问题
      </Button>
    );
  }

  return (
    <Card className="p-4">
      <form ref={formRef} action={action} className="space-y-3">
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
          <Select id="isev" name="severity" defaultValue="">
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
