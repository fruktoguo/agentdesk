import "server-only";
import { prisma } from "@/lib/prisma";
import { Priority, Source, TaskStatus } from "@/lib/db";
import { recordEvent, type Actor } from "@/lib/event-service";

export interface TaskCreateInput {
  title: string;
  description?: string;
  type?: string;
  priority?: Priority;
}

export type ClaimResult =
  | { ok: true; task: Awaited<ReturnType<typeof prisma.task.findUnique>> }
  | { ok: false; code: "NOT_FOUND" }
  | {
      ok: false;
      code: "NOT_CLAIMABLE";
      status: string;
      claimedBy: string | null;
    };

export type ClaimNextResult =
  | { ok: true; task: Awaited<ReturnType<typeof prisma.task.findFirst>> }
  | { ok: false; code: "NO_OPEN_TASK" };

type ProjectScope = {
  projectId?: string;
};

// ───────────────────────── 创建 ─────────────────────────
export async function createTask(
  projectId: string,
  input: TaskCreateInput,
  actor: Actor,
  via: Source,
) {
  const task = await prisma.task.create({
    data: {
      projectId,
      title: input.title,
      description: input.description,
      type: input.type ?? "general",
      priority: input.priority ?? Priority.MEDIUM,
      status: TaskStatus.OPEN,
      createdVia: via,
      createdById: actor.userId,
      createdByRole: actor.type === "agent" ? actor.role : null,
    },
  });
  await recordEvent({
    projectId,
    type: "task_created",
    taskId: task.id,
    actor,
    summary: `创建任务「${task.title}」`,
  });
  return task;
}

// ───────────────────────── 领取指定任务 ─────────────────────────
export async function claimTask(
  taskId: string,
  actor: Actor,
  scope: ProjectScope = {},
): Promise<ClaimResult> {
  const r = await prisma.task.updateMany({
    where: {
      id: taskId,
      ...(scope.projectId ? { projectId: scope.projectId } : {}),
      status: { in: [TaskStatus.OPEN, TaskStatus.NEEDS_FIX] },
    },
    data: {
      status: TaskStatus.CLAIMED,
      claimedByRole: actor.role,
      claimedAt: new Date(),
      claimedByTokenId: actor.tokenId,
      version: { increment: 1 },
    },
  });

  if (r.count === 0) {
    const cur = await prisma.task.findFirst({
      where: { id: taskId, ...(scope.projectId ? { projectId: scope.projectId } : {}) },
      select: { projectId: true, status: true, claimedByRole: true, title: true },
    });
    if (!cur) return { ok: false, code: "NOT_FOUND" };
    return {
      ok: false,
      code: "NOT_CLAIMABLE",
      status: cur.status,
      claimedBy: cur.claimedByRole,
    };
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  await recordEvent({
    projectId: task!.projectId,
    type: "task_claimed",
    taskId,
    actor,
    summary: `${actor.role} 领取了「${task!.title}」`,
  });
  return { ok: true, task };
}

// ───────────────────────── 智能领取（原子弹出下一个） ─────────────────────────
export async function claimNextTask(
  projectId: string,
  actor: Actor,
): Promise<ClaimNextResult> {
  return prisma.$transaction(async (tx) => {
    const candidate = await tx.task.findFirst({
      where: {
        projectId,
        status: { in: [TaskStatus.OPEN, TaskStatus.NEEDS_FIX] },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    });
    if (!candidate) return { ok: false, code: "NO_OPEN_TASK" } as const;

    const r = await tx.task.updateMany({
      where: {
        id: candidate.id,
        projectId,
        status: { in: [TaskStatus.OPEN, TaskStatus.NEEDS_FIX] },
      },
      data: {
        status: TaskStatus.CLAIMED,
        claimedByRole: actor.role,
        claimedAt: new Date(),
        claimedByTokenId: actor.tokenId,
        version: { increment: 1 },
      },
    });
    if (r.count === 0) return { ok: false, code: "NO_OPEN_TASK" } as const;

    const task = await tx.task.findUnique({ where: { id: candidate.id } });
    return { ok: true, task } as const;
  }).then(async (result) => {
    if (!result.ok) return result;
    await recordEvent({
      projectId,
      type: "task_claimed",
      taskId: result.task!.id,
      actor,
      summary: `${actor.role} 领取了「${result.task!.title}」`,
      payload: { via: "claim-next" },
    });
    return result;
  });
}

// ───────────────────────── 释放 ─────────────────────────
export async function releaseTask(
  taskId: string,
  actor: Actor,
  scope: ProjectScope = {},
) {
  const r = await prisma.task.updateMany({
    where: {
      id: taskId,
      ...(scope.projectId ? { projectId: scope.projectId } : {}),
      status: TaskStatus.CLAIMED,
    },
    data: {
      status: TaskStatus.OPEN,
      claimedByRole: null,
      claimedAt: null,
      claimedByTokenId: null,
      version: { increment: 1 },
    },
  });
  if (r.count === 0) return { ok: false as const, code: "NOT_CLAIMED" };
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  await recordEvent({
    projectId: task!.projectId,
    type: "task_released",
    taskId,
    actor,
    summary: `${actor.role} 释放了「${task!.title}」`,
  });
  return { ok: true as const, task };
}

// ───────────────────────── 完成 ─────────────────────────
export async function completeTask(
  taskId: string,
  actor: Actor,
  result?: string,
  scope: ProjectScope = {},
) {
  const r = await prisma.task.updateMany({
    where: {
      id: taskId,
      ...(scope.projectId ? { projectId: scope.projectId } : {}),
      status: TaskStatus.CLAIMED,
    },
    data: { status: TaskStatus.DONE, result, version: { increment: 1 } },
  });
  if (r.count === 0) return { ok: false as const, code: "NOT_CLAIMED" };
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  await recordEvent({
    projectId: task!.projectId,
    type: "task_completed",
    taskId,
    actor,
    summary: `${actor.role} 完成了「${task!.title}」`,
    payload: result ? { result } : undefined,
  });
  return { ok: true as const, task };
}

// ───────────────────────── 打回待修复 ─────────────────────────
export async function markNeedsFix(
  taskId: string,
  actor: Actor,
  reason?: string,
  scope: ProjectScope = {},
) {
  const r = await prisma.task.updateMany({
    where: {
      id: taskId,
      ...(scope.projectId ? { projectId: scope.projectId } : {}),
      status: TaskStatus.CLAIMED,
    },
    data: { status: TaskStatus.NEEDS_FIX, result: reason, version: { increment: 1 } },
  });
  if (r.count === 0) return { ok: false as const, code: "NOT_CLAIMED" };
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  await recordEvent({
    projectId: task!.projectId,
    type: "task_needs_fix",
    taskId,
    actor,
    summary: `${actor.role} 把「${task!.title}」打回待修复`,
    payload: reason ? { reason } : undefined,
  });
  return { ok: true as const, task };
}

// ───────────────────────── 取消 ─────────────────────────
export async function cancelTask(
  taskId: string,
  actor: Actor,
  scope: ProjectScope = {},
) {
  const r = await prisma.task.updateMany({
    where: {
      id: taskId,
      ...(scope.projectId ? { projectId: scope.projectId } : {}),
      status: { not: TaskStatus.DONE },
    },
    data: { status: TaskStatus.CANCELLED, version: { increment: 1 } },
  });
  if (r.count === 0) return { ok: false as const, code: "ALREADY_DONE" };
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  await recordEvent({
    projectId: task!.projectId,
    type: "task_cancelled",
    taskId,
    actor,
    summary: `取消「${task!.title}」`,
  });
  return { ok: true as const, task };
}
