"use client";

import { resolveIssueAction, convertIssueAction } from "@/app/actions/issues";
import { Button } from "@/components/ui/button";
import { formAction } from "@/lib/utils";

export function IssueActions({
  projectId,
  issueId,
  converted,
}: {
  projectId: string;
  issueId: string;
  converted: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-2">
      {!converted && (
        <form
          action={formAction(convertIssueAction.bind(null, projectId, issueId))}
          onSubmit={(e) => {
            if (!confirm("将此问题转为任务？会创建一条待领取任务。"))
              e.preventDefault();
          }}
        >
          <Button type="submit" variant="yellow" size="sm">
            转为任务
          </Button>
        </form>
      )}
      <form action={formAction(resolveIssueAction.bind(null, projectId, issueId))}>
        <Button type="submit" variant="success" size="sm">
          标记解决
        </Button>
      </form>
    </div>
  );
}
