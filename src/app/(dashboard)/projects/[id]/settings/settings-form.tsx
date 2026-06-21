"use client";

import { useActionState } from "react";
import { updateProjectAction } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Spinner } from "@/components/ui/feedback";
import { Alert } from "@/components/ui/alert";
import type { ActionResult } from "@/lib/types";

export function SettingsForm({
  projectId,
  name,
  description,
}: {
  projectId: string;
  name: string;
  description?: string | null;
}) {
  const [state, action, pending] = useActionState(
    updateProjectAction.bind(null, projectId),
    { ok: false } as ActionResult,
  );

  return (
    <form action={action} className="space-y-3">
      <div>
        <Label htmlFor="name">项目名称</Label>
        <Input id="name" name="name" defaultValue={name} />
        <FieldError>{state.errors?.name?.[0]}</FieldError>
      </div>
      <div>
        <Label htmlFor="desc">描述</Label>
        <Textarea
          id="desc"
          name="description"
          rows={3}
          defaultValue={description ?? ""}
        />
      </div>
      {state.ok && <Alert variant="success">已保存</Alert>}
      {state.error && <Alert variant="error">{state.error}</Alert>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending && <Spinner className="size-4 border-[3px]" />}
        {pending ? "保存中…" : "保存修改"}
      </Button>
    </form>
  );
}
