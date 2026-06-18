import { prisma } from "@/lib/prisma";
import { TaskStatus, IssueStatus } from "@/lib/db";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "@/components/timeline";

const TASK_STATS: { status: string; label: string; color: string }[] = [
  { status: TaskStatus.OPEN, label: "待领取", color: "bg-sky text-white" },
  { status: TaskStatus.CLAIMED, label: "进行中", color: "bg-surface" },
  { status: TaskStatus.NEEDS_FIX, label: "待修复", color: "bg-sun" },
  { status: TaskStatus.DONE, label: "已完成", color: "bg-grass" },
];

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [taskGrouped, taskTotal, issueOpen, recentEvents, activeAgents] =
    await Promise.all([
      prisma.task.groupBy({
        by: ["status"],
        where: { projectId: id },
        _count: { _all: true },
      }),
      prisma.task.count({ where: { projectId: id } }),
      prisma.issue.count({
        where: { projectId: id, status: IssueStatus.OPEN },
      }),
      prisma.event.findMany({
        where: { projectId: id },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.task.findMany({
        where: {
          projectId: id,
          claimedByRole: { not: null },
          status: TaskStatus.CLAIMED,
        },
        select: { claimedByRole: true },
        distinct: ["claimedByRole"],
      }),
    ]);

  const countOf = (s: string) =>
    taskGrouped.find((g) => g.status === s)?._count?._all ?? 0;
  const agents = activeAgents
    .map((a) => a.claimedByRole)
    .filter((r): r is string => !!r);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="bg-ink p-4 text-white">
          <p className="text-xs font-bold uppercase opacity-70">总任务</p>
          <p className="heading mt-1 text-3xl">{taskTotal}</p>
        </Card>
        {TASK_STATS.map((c) => (
          <Card key={c.status} className={`p-4 ${c.color}`}>
            <p className="text-xs font-bold uppercase">{c.label}</p>
            <p className="heading mt-1 text-3xl">{countOf(c.status)}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-grape p-4 text-white">
          <p className="text-xs font-bold uppercase opacity-80">待解决问题</p>
          <p className="heading mt-1 text-3xl">{issueOpen}</p>
        </Card>
        <Card>
          <CardBody>
            <p className="mb-2 text-xs font-bold uppercase text-muted">
              当前工作中的 AI 角色
            </p>
            {agents.length === 0 ? (
              <p className="text-sm text-muted">暂无 agent 在处理任务</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {agents.map((r) => (
                  <Badge key={r} color="blue">
                    🤖 {r}
                  </Badge>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <p className="mb-4 text-xs font-bold uppercase text-muted">
            最近活动（统一留档）
          </p>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-muted">还没有活动记录。</p>
          ) : (
            <Timeline events={recentEvents} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
