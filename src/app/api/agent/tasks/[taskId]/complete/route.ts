import { authenticateAgent, unauthorized } from "@/lib/api-auth";
import { completeTask } from "@/lib/task-service";
import { serializeTask } from "@/lib/serialize";
import { apiCompleteSchema } from "@/lib/validation";
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

  const body = await req.json().catch(() => ({}));
  const parsed = apiCompleteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "参数校验失败", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const r = await completeTask(
    taskId,
    { type: "agent", role: auth.role, tokenId: auth.tokenId },
    parsed.data.result,
  );
  if (!r.ok) {
    return Response.json({ error: "任务当前未被领取" }, { status: 409 });
  }
  return Response.json({ task: serializeTask(r.task!) });
}
