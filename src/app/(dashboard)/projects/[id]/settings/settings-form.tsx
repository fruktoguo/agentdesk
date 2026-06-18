"use client";

import { useActionState } from "react";
import { updateProjectAction } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
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
      {state.ok && (
        <p className="border-2 border-ink bg-grass px-3 py-1.5 text-sm font-bold">
          ✓ 已保存
        </p>
      )}
      {state.error && (
        <p className="text-sm font-bold text-accent">{state.error}</p>
      )}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "保存中…" : "保存修改"}
      </Button>
    </form>
  );
}
