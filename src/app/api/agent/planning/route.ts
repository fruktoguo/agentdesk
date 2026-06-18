import { authenticateAgent, unauthorized } from "@/lib/api-auth";
import { recordEvent } from "@/lib/event-service";
import { apiPlanningUpdateSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** 读取项目规划文档 */
export async function GET(req: Request) {
  const auth = await authenticateAgent(req);
  if ("error" in auth) return unauthorized(auth);

  const project = await prisma.project.findUnique({
    where: { id: auth.projectId },
    select: { planning: true },
  });
  return Response.json({ planning: project?.planning ?? "" });
}

/** 更新项目规划文档（留档） */
export async function PUT(req: Request) {
  const auth = await authenticateAgent(req);
  if ("error" in auth) return unauthorized(auth);

  const body = await req.json().catch(() => ({}));
  const parsed = apiPlanningUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "参数校验失败", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  await prisma.project.update({
    where: { id: auth.projectId },
    data: { planning: parsed.data.planning },
  });
  await recordEvent({
    projectId: auth.projectId,
    type: "planning_updated",
    actor: { type: "agent", role: auth.role, tokenId: auth.tokenId },
    summary: `${auth.role} 更新了项目规划`,
  });
  return Response.json({ planning: parsed.data.planning });
}
