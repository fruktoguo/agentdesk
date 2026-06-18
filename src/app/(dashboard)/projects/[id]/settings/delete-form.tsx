"use client";

import { deleteProjectAction } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { formAction } from "@/lib/utils";

export function DeleteForm({ projectId }: { projectId: string }) {
  return (
    <form
      action={formAction(deleteProjectAction.bind(null, projectId))}
      onSubmit={(e) => {
        if (
          !confirm(
            "确定删除此项目？所有任务、事件与 token 将一并永久删除，不可恢复。",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="danger" size="sm">
        删除项目
      </Button>
    </form>
  );
}
