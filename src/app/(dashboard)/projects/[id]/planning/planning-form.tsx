"use client";

import { useActionState } from "react";
import { updatePlanningAction } from "@/app/actions/planning";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Textarea, FieldError } from "@/components/ui/input";
import { Spinner } from "@/components/ui/feedback";
import { Alert } from "@/components/ui/alert";
import type { ActionResult } from "@/lib/types";

export function PlanningForm({
  projectId,
  initialPlanning,
  canEdit,
}: {
  projectId: string;
  initialPlanning: string;
  canEdit: boolean;
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
        {canEdit ? (
          <form action={action} className="space-y-3">
            <Textarea
              name="planning"
              defaultValue={initialPlanning}
              rows={22}
              placeholder="# 规划&#10;&#10;写下目标、阶段、待办方向…"
              className="font-mono text-sm"
            />
            <FieldError>{state.errors?.planning?.[0]}</FieldError>
            {state.ok && <Alert variant="success">已保存</Alert>}
            {state.error && <Alert variant="error">{state.error}</Alert>}
            <Button type="submit" size="sm" disabled={pending}>
              {pending && <Spinner className="size-4 border-[3px]" />}
              {pending ? "保存中…" : "保存规划"}
            </Button>
          </form>
        ) : (
          <>
            <pre className="whitespace-pre-wrap break-words rounded-input border-2 border-ink bg-paper p-3 font-mono text-sm">
              {initialPlanning || "（暂无规划）"}
            </pre>
            <p className="mt-3 text-xs font-medium text-muted">
              仅项目拥有者可在 Web 端修改规划；AI 可通过 API 更新。
            </p>
          </>
        )}
      </CardBody>
    </Card>
  );
}
