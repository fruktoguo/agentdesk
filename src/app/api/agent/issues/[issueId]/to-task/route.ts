import { authenticateAgent, unauthorized } from "@/lib/api-auth";
import { convertIssueToTask } from "@/lib/issue-service";
import { serializeTask } from "@/lib/serialize";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** 问题转任务：创建一条 OPEN 任务，回填 fromIssueId / convertedTaskId */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ issueId: string }> },
) {
  const { issueId } = await ctx.params;
  const auth = await authenticateAgent(req);
  if ("error" in auth) return unauthorized(auth);

  const owned = await prisma.issue.findUnique({
    where: { id: issueId },
    select: { projectId: true },
  });
  if (!owned) return Response.json({ error: "问题不存在" }, { status: 404 });
  if (owned.projectId !== auth.projectId) {
    return Response.json({ error: "无权操作" }, { status: 403 });
  }

  const r = await convertIssueToTask(issueId, {
    type: "agent",
    role: auth.role,
    tokenId: auth.tokenId,
  }, { projectId: auth.projectId });
  if (!r.ok) {
    if (r.code === "NOT_FOUND") {
      return Response.json({ error: "问题不存在" }, { status: 404 });
    }
    return Response.json({ error: "问题已转换过" }, { status: 409 });
  }
  return Response.json({ task: serializeTask(r.task!) }, { status: 201 });
}
