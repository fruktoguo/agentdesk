import { authenticateAgent, unauthorized } from "@/lib/api-auth";
import { createTask } from "@/lib/task-service";
import { apiTaskCreateSchema } from "@/lib/validation";
import { serializeTask } from "@/lib/serialize";
import { prisma } from "@/lib/prisma";
import { Source, TaskStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

/** 列任务（token 对应项目，可按 status 过滤） */
export async function GET(req: Request) {
  const auth = await authenticateAgent(req);
  if ("error" in auth) return unauthorized(auth);

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const tasks = await prisma.task.findMany({
    where: {
      projectId: auth.projectId,
      ...(status ? { status: status as TaskStatus } : {}),
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: 200,
  });
  return Response.json({ tasks: tasks.map(serializeTask) });
}

/** 创建任务（token 对应项目） */
export async function POST(req: Request) {
  const auth = await authenticateAgent(req);
  if ("error" in auth) return unauthorized(auth);

  const body = await req.json().catch(() => null);
  const parsed = apiTaskCreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "参数校验失败", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const task = await createTask(
    auth.projectId,
    parsed.data,
    { type: "agent", role: auth.role, tokenId: auth.tokenId },
    Source.API,
  );
  return Response.json({ task: serializeTask(task) }, { status: 201 });
}
