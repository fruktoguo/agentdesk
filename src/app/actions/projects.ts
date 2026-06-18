"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireOwner } from "@/lib/dal";
import { projectCreateSchema, projectUpdateSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

function fieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[]> };
}): Record<string, string[]> {
  return error.flatten().fieldErrors;
}

export async function createProjectAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "请先登录" };

  const parsed = projectCreateSchema.safeParse({
    name: formData.get("name"),
    description: (formData.get("description") as string) || undefined,
  });
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const project = await prisma.project.create({
    data: { name: parsed.data.name, description: parsed.data.description, ownerId: user.id },
  });
  redirect(`/projects/${project.id}`);
}

export async function updateProjectAction(
  projectId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireOwner(projectId);
  if (!user) return { ok: false, error: "只有项目拥有者可以编辑" };

  const parsed = projectUpdateSchema.safeParse({
    name: formData.get("name"),
    description: (formData.get("description") as string) || undefined,
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  await prisma.project.update({ where: { id: projectId }, data: parsed.data });
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

export async function deleteProjectAction(
  projectId: string,
): Promise<ActionResult> {
  const user = await requireOwner(projectId);
  if (!user) return { ok: false, error: "只有项目拥有者可以删除" };

  await prisma.project.delete({ where: { id: projectId } });
  redirect("/projects");
}
