"use client";

import { cancelTaskAction } from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { formAction } from "@/lib/utils";

export function CancelButton({
  projectId,
  taskId,
}: {
  projectId: string;
  taskId: string;
}) {
  return (
    <form
      action={formAction(cancelTaskAction.bind(null, projectId, taskId))}
      onSubmit={(e) => {
        if (!confirm("取消此任务？取消后可在事件时间线看到记录。"))
          e.preventDefault();
      }}
    >
      <Button type="submit" variant="danger" size="sm">
        取消任务
      </Button>
    </form>
  );
}
