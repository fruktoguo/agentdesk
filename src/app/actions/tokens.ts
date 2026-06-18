"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { generateToken } from "@/lib/api-token";
import { recordEvent } from "@/lib/event-service";
import type { ActionResult } from "@/lib/types";

export async function createTokenAction(
  projectId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult & { token?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "请先登录" };

  const name = (formData.get("name") as string)?.trim() || "默认";
  const { token, tokenHash, prefix } = generateToken();
  await prisma.projectToken.create({
    data: { projectId, name, tokenHash, prefix, createdById: user.id },
  });
  await recordEvent({
    projectId,
    type: "token_created",
    actor: { type: "user", userId: user.id, role: user.name },
    summary: `生成 token「${name}」`,
  });
  revalidatePath(`/projects/${projectId}/tokens`);
  return { ok: true, token };
}

export async function revokeTokenAction(
  projectId: string,
  tokenId: string,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "请先登录" };

  const r = await prisma.projectToken.updateMany({
    where: { id: tokenId, projectId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  if (r.count > 0) {
    await recordEvent({
      projectId,
      type: "token_revoked",
      actor: { type: "user", userId: user.id, role: user.name },
      summary: "吊销了一个 token",
    });
  }
  revalidatePath(`/projects/${projectId}/tokens`);
  return { ok: true };
}
