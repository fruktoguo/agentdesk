import "server-only";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/api-token";

export interface AgentContext {
  projectId: string;
  role: string;
  tokenId: string;
}

export type AgentAuthResult =
  | AgentContext
  | { error: string; status: number };

/**
 * 解析并校验 AI 请求：Authorization: Bearer <token> + X-Agent-Role: <角色名>
 * 成功返回 { projectId, role, tokenId }，失败返回错误信息与状态码
 */
export async function authenticateAgent(
  req: Request,
): Promise<AgentAuthResult> {
  const auth = req.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return { error: "缺少 Authorization Bearer token", status: 401 };
  }

  const role = req.headers.get("x-agent-role")?.trim();
  if (!role) {
    return { error: "缺少 X-Agent-Role 请求头（角色名称）", status: 401 };
  }

  const tokenHash = hashToken(match[1]);
  const record = await prisma.projectToken.findFirst({
    where: { tokenHash, revokedAt: null },
    select: { id: true, projectId: true },
  });
  if (!record) {
    return { error: "无效或已吊销的 token", status: 401 };
  }

  // 异步刷新最近使用时间，不阻塞响应
  prisma.projectToken
    .update({
      where: { id: record.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return { projectId: record.projectId, role, tokenId: record.id };
}

/** 若认证失败，直接返回标准 JSON 错误响应 */
export function unauthorized(
  result: { error: string; status: number },
): Response {
  return Response.json({ error: result.error }, { status: result.status });
}
