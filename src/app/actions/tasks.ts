"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertTaskInProject, requireProjectOwner, requireUser } from "@/lib/dal";
import { taskCreateSchema, commentCreateSchema } from "@/lib/validation";
import { createTask, cancelTask } from "@/lib/task-service";
import { recordEvent } from "@/lib/event-service";
import { Source } from "@/lib/db";
import type { ActionResult } from "@/lib/types";

export async function createTaskAction(
  projectId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireProjectOwner(projectId);
  if (!user) return { ok: false, error: "无权操作" };

  const parsed = taskCreateSchema.safeParse({
    title: formData.get("title"),
    description: (formData.get("description") as string) || undefined,
    priority: formData.get("priority") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  await createTask(
    projectId,
    parsed.data,
    { type: "user", userId: user.id, role: user.name },
    Source.WEB,
  );
  revalidatePath(`/projects/${projectId}/tasks`);
  return { ok: true };
}

export async function cancelTaskAction(
  projectId: string,
  taskId: string,
): Promise<ActionResult> {
  const user = await requireProjectOwner(projectId);
  if (!user) return { ok: false, error: "无权操作" };

  const taskBelongsToProject = await assertTaskInProject(taskId, projectId);
  if (!taskBelongsToProject) return { ok: false, error: "任务不存在或无权操作" };

  await cancelTask(
    taskId,
    { type: "user", userId: user.id, role: user.name },
    { projectId },
  );
  revalidatePath(`/projects/${projectId}/tasks`);
  return { ok: true };
}

export async function addCommentAction(
  projectId: string,
  taskId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const taskBelongsToProject = await assertTaskInProject(taskId, projectId);
  if (!taskBelongsToProject) return { ok: false, error: "任务不存在或无权操作" };

  const parsed = commentCreateSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const comment = await prisma.comment.create({
    data: {
      taskId,
      projectId,
      body: parsed.data.body,
      authorType: "user",
      authorRole: user.name,
      authorId: user.id,
    },
  });
  await recordEvent({
    projectId,
    type: "task_commented",
    taskId,
    actor: { type: "user", userId: user.id, role: user.name },
    summary: `${user.name} 评论了任务`,
    payload: { commentId: comment.id },
  });
  revalidatePath(`/projects/${projectId}/tasks`);
  return { ok: true };
}
