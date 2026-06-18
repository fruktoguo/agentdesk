"use client";

import { useActionState } from "react";
import { updatePlanningAction } from "@/app/actions/planning";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Textarea, FieldError } from "@/components/ui/input";
import type { ActionResult } from "@/lib/types";

export function PlanningForm({
  projectId,
  initialPlanning,
}: {
  projectId: string;
  initialPlanning: string;
}) {
  const [state, action, pending] = useActionState(
    updatePlanningAction.bind(null, projectId),
    { ok: false } as ActionResult,
  );

  return (
    <Card>
      <CardHeader className="bg-grape text-white">
        <h2 className="heading text-xl">项目规划</h2>
        <p className="mt-1 text-sm font-medium text-white/80">
          一份 Markdown 规划文档。人和 AI（PUT /api/agent/planning）都能读写，更新会留档。
        </p>
      </CardHeader>
      <CardBody>
        <form action={action} className="space-y-3">
          <Textarea
            name="planning"
            defaultValue={initialPlanning}
            rows={22}
            placeholder="# 规划&#10;&#10;写下目标、阶段、待办方向…"
            className="font-mono text-sm"
          />
          <FieldError>{state.errors?.planning?.[0]}</FieldError>
          {state.ok && (
            <p className="border-2 border-ink bg-grass px-3 py-1.5 text-sm font-bold">
              ✓ 已保存
            </p>
          )}
          {state.error && (
            <p className="text-sm font-bold text-accent">{state.error}</p>
          )}
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "保存中…" : "保存规划"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
