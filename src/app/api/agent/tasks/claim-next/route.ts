import { authenticateAgent, unauthorized } from "@/lib/api-auth";
import { claimNextTask } from "@/lib/task-service";
import { serializeTask } from "@/lib/serialize";

export const dynamic = "force-dynamic";

/** 智能领取：按优先级 + 先进先出原子弹出下一个可领取任务 */
export async function POST(req: Request) {
  const auth = await authenticateAgent(req);
  if ("error" in auth) return unauthorized(auth);

  const r = await claimNextTask(auth.projectId, {
    type: "agent",
    role: auth.role,
    tokenId: auth.tokenId,
  });
  if (!r.ok) {
    return Response.json({ error: "当前没有可领取的任务" }, { status: 404 });
  }
  return Response.json({ task: serializeTask(r.task!) });
}
