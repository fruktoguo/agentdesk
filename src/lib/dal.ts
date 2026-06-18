import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/** 当前登录用户（未登录返回 null），用 React cache 单次渲染去重 */
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const payload = await decrypt(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload?.userId) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });
});

/** 要求已登录，否则跳登录页 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * 要求是项目拥有者（管理操作：编辑/删除项目）。
 * 成功返回 user，失败返回 null（无权）。访问项目本身只需登录。
 */
export async function requireOwner(projectId: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project || project.ownerId !== user.id) return null;
  return user;
}
