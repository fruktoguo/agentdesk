import { authenticateAgent, unauthorized } from "@/lib/api-auth";
import { claimTask } from "@/lib/task-service";
import { serializeTask } from "@/lib/serialize";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** 领取指定任务；已被领取返回 409 + 领取者角色名 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await ctx.params;
  const auth = await authenticateAgent(req);
  if ("error" in auth) return unauthorized(auth);

  const owned = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  });
  if (!owned) return Response.json({ error: "任务不存在" }, { status: 404 });
  if (owned.projectId !== auth.projectId) {
    return Response.json({ error: "无权操作" }, { status: 403 });
  }

  const r = await claimTask(taskId, {
    type: "agent",
    role: auth.role,
    tokenId: auth.tokenId,
  }, { projectId: auth.projectId });
  if (!r.ok) {
    if (r.code === "NOT_FOUND") {
      return Response.json({ error: "任务不存在" }, { status: 404 });
    }
    return Response.json(
      { error: "任务不可领取", status: r.status, claimedBy: r.claimedBy },
      { status: 409 },
    );
  }
  return Response.json({ task: serializeTask(r.task!) });
}
