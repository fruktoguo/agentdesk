"use client";

import { useActionState } from "react";
import { resolveIssueAction, convertIssueAction } from "@/app/actions/issues";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/feedback";
import { DestructiveAction } from "@/components/ui/destructive-action";
import type { ActionResult } from "@/lib/types";

export function IssueActions({
  projectId,
  issueId,
  converted,
}: {
  projectId: string;
  issueId: string;
  converted: boolean;
}) {
  // 标记解决：非破坏性，直接提交但带 pending 反馈
  const resolve = resolveIssueAction.bind(null, projectId, issueId);
  const [, submit, pending] = useActionState(
    async (_prev: ActionResult): Promise<ActionResult> => resolve(),
    { ok: false },
  );

  return (
    <div className="flex shrink-0 flex-col gap-2">
      {!converted && (
        <DestructiveAction
          label="转为任务"
          title="将此问题转为任务？"
          description="会创建一条待领取任务。"
          confirmLabel="转换"
          buttonVariant="yellow"
          action={convertIssueAction.bind(null, projectId, issueId)}
        />
      )}
      <form action={submit}>
        <Button
          type="submit"
          variant="success"
          size="sm"
          disabled={pending}
          className="w-full"
        >
          {pending && <Spinner className="size-4 border-[3px]" />}
          {pending ? "处理中…" : "标记解决"}
        </Button>
      </form>
    </div>
  );
}
