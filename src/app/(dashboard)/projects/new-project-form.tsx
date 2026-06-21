"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { createProjectAction } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Spinner } from "@/components/ui/feedback";
import { Alert } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import type { ActionResult } from "@/lib/types";

export function NewProjectForm() {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createProjectAction, {
    ok: false,
  } as ActionResult);

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
        新建项目
      </Button>
    );
  }

  return (
    <Card className="p-4">
      <form ref={formRef} action={action} className="space-y-3">
        <div>
          <Label htmlFor="pname">项目名称</Label>
          <Input
            id="pname"
            name="name"
            placeholder="例如：代码审查机器人"
            autoFocus
          />
          <FieldError>{state.errors?.name?.[0]}</FieldError>
        </div>
        <div>
          <Label htmlFor="pdesc">描述（可选）</Label>
          <Textarea
            id="pdesc"
            name="description"
            rows={2}
            placeholder="这个项目用来做什么"
          />
        </div>
        {state.error && <Alert variant="error">{state.error}</Alert>}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending && <Spinner className="size-4 border-[3px]" />}
            {pending ? "创建中…" : "创建项目"}
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
