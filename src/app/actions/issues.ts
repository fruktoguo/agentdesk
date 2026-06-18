"use server";

import { revalidatePath } from "next/cache";
import { assertIssueInProject, requireProjectOwner } from "@/lib/dal";
import { issueCreateSchema } from "@/lib/validation";
import { createIssue, resolveIssue, convertIssueToTask } from "@/lib/issue-service";
import { Source } from "@/lib/db";
import type { ActionResult } from "@/lib/types";

export async function createIssueAction(
  projectId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireProjectOwner(projectId);
  if (!user) return { ok: false, error: "无权操作" };

  const parsed = issueCreateSchema.safeParse({
    title: formData.get("title"),
    description: (formData.get("description") as string) || undefined,
    severity: formData.get("severity") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  await createIssue(
    projectId,
    parsed.data,
    { type: "user", userId: user.id, role: user.name },
    Source.WEB,
  );
  revalidatePath(`/projects/${projectId}/issues`);
  return { ok: true };
}

export async function resolveIssueAction(
  projectId: string,
  issueId: string,
): Promise<ActionResult> {
  const user = await requireProjectOwner(projectId);
  if (!user) return { ok: false, error: "无权操作" };

  const issueBelongsToProject = await assertIssueInProject(issueId, projectId);
  if (!issueBelongsToProject) return { ok: false, error: "问题不存在或无权操作" };

  await resolveIssue(issueId, { type: "user", userId: user.id, role: user.name });
  revalidatePath(`/projects/${projectId}/issues`);
  return { ok: true };
}

export async function convertIssueAction(
  projectId: string,
  issueId: string,
): Promise<ActionResult> {
  const user = await requireProjectOwner(projectId);
  if (!user) return { ok: false, error: "无权操作" };

  const issueBelongsToProject = await assertIssueInProject(issueId, projectId);
  if (!issueBelongsToProject) return { ok: false, error: "问题不存在或无权操作" };

  const result = await convertIssueToTask(issueId, {
    type: "user",
    userId: user.id,
    role: user.name,
  });
  if (!result.ok) {
    return {
      ok: false,
      error: result.code === "ALREADY_CONVERTED" ? "问题已转为任务" : "问题不存在",
    };
  }
  revalidatePath(`/projects/${projectId}/issues`);
  revalidatePath(`/projects/${projectId}/tasks`);
  return { ok: true };
}
