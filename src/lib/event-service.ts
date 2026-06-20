import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { publishProjectEvent } from "@/lib/realtime";

export interface Actor {
  type: "user" | "agent";
  role?: string | null;
  userId?: string;
  tokenId?: string;
}

/**
 * 记录一条统一事件并广播给 SSE 订阅者。
 * 所有写操作（任务/问题/规划/token）都通过此留档。
 */
export async function recordEvent(params: {
  projectId: string;
  type: string;
  taskId?: string;
  issueId?: string;
  actor: Actor;
  summary?: string;
  payload?: Record<string, unknown>;
}) {
  const event = await prisma.event.create({
    data: {
      projectId: params.projectId,
      type: params.type,
      taskId: params.taskId,
      issueId: params.issueId,
      actorType: params.actor.type,
      actorRole: params.actor.role ?? null,
      summary: params.summary,
      payload: params.payload as Prisma.InputJsonValue | undefined,
    },
  });

  await publishProjectEvent(params.projectId, {
    eventId: event.id,
    type: params.type,
    taskId: params.taskId,
    issueId: params.issueId,
    actorRole: params.actor.role ?? null,
    actorType: params.actor.type,
    summary: params.summary,
    createdAt: event.createdAt.toISOString(),
  });

  return event;
}
