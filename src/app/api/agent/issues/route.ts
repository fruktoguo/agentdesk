import { authenticateAgent, unauthorized } from "@/lib/api-auth";
import { createIssue } from "@/lib/issue-service";
import { apiIssueCreateSchema } from "@/lib/validation";
import { serializeIssue } from "@/lib/serialize";
import { prisma } from "@/lib/prisma";
import { Source, IssueStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

/** 列问题（token 对应项目，可按 status 过滤） */
export async function GET(req: Request) {
  const auth = await authenticateAgent(req);
  if ("error" in auth) return unauthorized(auth);

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const issues = await prisma.issue.findMany({
    where: {
      projectId: auth.projectId,
      ...(status ? { status: status as IssueStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return Response.json({ issues: issues.map(serializeIssue) });
}

/** 创建问题（token 对应项目） */
export async function POST(req: Request) {
  const auth = await authenticateAgent(req);
  if ("error" in auth) return unauthorized(auth);

  const body = await req.json().catch(() => null);
  const parsed = apiIssueCreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "参数校验失败", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const issue = await createIssue(
    auth.projectId,
    parsed.data,
    { type: "agent", role: auth.role, tokenId: auth.tokenId },
    Source.API,
  );
  return Response.json({ issue: serializeIssue(issue) }, { status: 201 });
}
