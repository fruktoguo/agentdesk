"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { recordEvent } from "@/lib/event-service";
import { planningUpdateSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

export async function updatePlanningAction(
  projectId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "请先登录" };

  const parsed = planningUpdateSchema.safeParse({
    planning: (formData.get("planning") as string) ?? "",
  });
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { planning: parsed.data.planning },
  });
  await recordEvent({
    projectId,
    type: "planning_updated",
    actor: { type: "user", userId: user.id, role: user.name },
    summary: `${user.name} 更新了项目规划`,
  });
  revalidatePath(`/projects/${projectId}/planning`);
  return { ok: true };
}
