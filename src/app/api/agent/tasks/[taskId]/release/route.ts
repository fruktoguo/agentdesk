import { authenticateAgent, unauthorized } from "@/lib/api-auth";
import { releaseTask } from "@/lib/task-service";
import { serializeTask } from "@/lib/serialize";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

  const r = await releaseTask(taskId, {
    type: "agent",
    role: auth.role,
    tokenId: auth.tokenId,
  });
  if (!r.ok) {
    return Response.json({ error: "任务当前未被领取" }, { status: 409 });
  }
  return Response.json({ task: serializeTask(r.task!) });
}
