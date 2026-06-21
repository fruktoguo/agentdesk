import { cancelTaskAction } from "@/app/actions/tasks";
import { DestructiveAction } from "@/components/ui/destructive-action";

export function CancelButton({
  projectId,
  taskId,
}: {
  projectId: string;
  taskId: string;
}) {
  return (
    <DestructiveAction
      label="取消任务"
      title="取消此任务？"
      description="取消后可在事件时间线看到记录。"
      confirmLabel="确认取消"
      buttonVariant="danger"
      action={cancelTaskAction.bind(null, projectId, taskId)}
    />
  );
}
