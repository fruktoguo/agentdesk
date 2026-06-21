import { deleteProjectAction } from "@/app/actions/projects";
import { DestructiveAction } from "@/components/ui/destructive-action";

export function DeleteForm({ projectId }: { projectId: string }) {
  return (
    <DestructiveAction
      label="删除项目"
      title="删除此项目？"
      description="所有任务、事件与 token 将一并永久删除，不可恢复。"
      confirmLabel="确认删除"
      buttonVariant="danger"
      action={deleteProjectAction.bind(null, projectId)}
    />
  );
}
