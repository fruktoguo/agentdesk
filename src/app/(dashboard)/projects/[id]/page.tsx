import Link from "next/link";
import { AlertTriangle, Bot, CheckCircle2, Wrench } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TaskStatus, IssueStatus } from "@/lib/db";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Timeline } from "@/components/timeline";

const TASK_STATS: { status: string; label: string; color: string }[] = [
  { status: TaskStatus.OPEN, label: "待领取", color: "bg-sky text-white" },
  { status: TaskStatus.CLAIMED, label: "进行中", color: "bg-surface" },
  { status: TaskStatus.NEEDS_FIX, label: "待修复", color: "bg-sun" },
  { status: TaskStatus.DONE, label: "已完成", color: "bg-grass" },
];

const SEVERITY: Record<string, { color: "accent" | "sun" | "muted"; label: string }> =
  {
    URGENT: { color: "accent", label: "紧急" },
    HIGH: { color: "sun", label: "高" },
    MEDIUM: { color: "muted", label: "中" },
    LOW: { color: "muted", label: "低" },
  };

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [
    taskGrouped,
    taskTotal,
    needsFixTasks,
    openIssues,
    recentEvents,
    activeAgents,
  ] = await Promise.all([
    prisma.task.groupBy({
      by: ["status"],
      where: { projectId: id },
      _count: { _all: true },
    }),
    prisma.task.count({ where: { projectId: id } }),
    // 待修复任务：最需要警醒，直接列出标题
    prisma.task.findMany({
      where: { projectId: id, status: TaskStatus.NEEDS_FIX },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, priority: true, claimedByRole: true },
    }),
    // 未解决问题：同样直接列出
    prisma.issue.findMany({
      where: { projectId: id, status: IssueStatus.OPEN },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: { id: true, title: true, severity: true },
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

  const needsFixCount = countOf(TaskStatus.NEEDS_FIX);
  const issueOpenCount = openIssues.length;
  const hasAlerts = needsFixTasks.length > 0 || openIssues.length > 0;
  const base = `/projects/${id}`;

  return (
    <div className="space-y-6">
      {/* ── 需要关注：进项目第一眼就看到具体的待修复任务与未解决问题 ── */}
      {hasAlerts ? (
        <Card className="overflow-hidden border-ink">
          <div className="flex items-center gap-2 border-b-2 border-ink bg-sun px-4 py-2.5">
            <Icon icon={AlertTriangle} size={18} className="text-ink" />
            <h2 className="heading text-base text-ink">需要关注</h2>
          </div>
          <div className="grid gap-0 sm:grid-cols-2 sm:divide-x-2 sm:divide-ink">
            {/* 待修复任务 */}
            <div className="border-b-2 border-ink p-4 sm:border-b-0">
              <Link
                href={`${base}/tasks`}
                className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted transition hover:text-ink"
              >
                <Icon icon={Wrench} size={14} />
                待修复任务（{needsFixCount}）
              </Link>
              {needsFixTasks.length === 0 ? (
                <p className="mt-3 text-sm text-muted">无待修复任务 🎉</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {needsFixTasks.map((t) => {
                    const prio = SEVERITY[t.priority] ?? SEVERITY.MEDIUM;
                    return (
                      <li key={t.id}>
                        <Link
                          href={`${base}/tasks/${t.id}`}
                          className="group flex items-center gap-2"
                        >
                          <Badge color="sun">{prio.label}</Badge>
                          <span className="min-w-0 flex-1 truncate text-sm font-bold group-hover:underline">
                            {t.title}
                          </span>
                          {t.claimedByRole && (
                            <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-muted">
                              <Icon icon={Bot} size={12} />
                              {t.claimedByRole}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                  {needsFixCount > needsFixTasks.length && (
                    <li>
                      <Link
                        href={`${base}/tasks`}
                        className="text-xs font-bold uppercase text-accent hover:underline"
                      >
                        查看全部 {needsFixCount} 项 →
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* 未解决问题 */}
            <div className="p-4">
              <Link
                href={`${base}/issues`}
                className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted transition hover:text-ink"
              >
                <Icon icon={AlertTriangle} size={14} />
                未解决问题（{issueOpenCount}）
              </Link>
              {openIssues.length === 0 ? (
                <p className="mt-3 text-sm text-muted">无未解决问题 🎉</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {openIssues.map((i) => {
                    const sev = SEVERITY[i.severity] ?? SEVERITY.MEDIUM;
                    return (
                      <li key={i.id}>
                        <Link
                          href={`${base}/issues`}
                          className="group flex items-center gap-2"
                        >
                          <Badge color={sev.color}>{sev.label}</Badge>
                          <span className="min-w-0 flex-1 truncate text-sm font-bold group-hover:underline">
                            {i.title}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex items-center gap-3 bg-grass p-4 text-ink">
          <Icon icon={CheckCircle2} size={24} />
          <div>
            <p className="heading text-base">一切正常</p>
            <p className="text-sm font-medium">当前没有待修复任务或未解决问题。</p>
          </div>
        </Card>
      )}

      {/* ── 任务统计 ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="bg-ink p-4 text-white">
          <p className="text-xs font-bold uppercase opacity-70">总任务</p>
          <p className="heading mt-1 text-3xl">{taskTotal}</p>
        </Card>
        {TASK_STATS.map((c) => (
          <Link key={c.status} href={`${base}/tasks`} className="block">
            <Card hover className={`p-4 ${c.color}`}>
              <p className="text-xs font-bold uppercase">{c.label}</p>
              <p className="heading mt-1 text-3xl">{countOf(c.status)}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href={`${base}/issues`} className="block">
          <Card hover className="bg-grape p-4 text-white">
            <p className="text-xs font-bold uppercase opacity-80">待解决问题</p>
            <p className="heading mt-1 text-3xl">{issueOpenCount}</p>
          </Card>
        </Link>
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
                    <Icon icon={Bot} size={12} />
                    {r}
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
