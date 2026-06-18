import { authenticateAgent, unauthorized } from "@/lib/api-auth";
import { resolveIssue } from "@/lib/issue-service";
import { serializeIssue } from "@/lib/serialize";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

  const r = await resolveIssue(issueId, { type: "agent", role: auth.role });
  if (!r.ok) {
    return Response.json({ error: "问题当前不可解决" }, { status: 409 });
  }
  return Response.json({ issue: serializeIssue(r.issue!) });
}
