import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Timeline } from "@/components/timeline";
import { CommentForm } from "./comment-form";
import { CancelButton } from "./cancel-button";

const PRIO_LABEL: Record<string, string> = {
  URGENT: "紧急",
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = await params;
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.projectId !== id) notFound();

  const [events, comments] = await Promise.all([
    prisma.event.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const done =
    task.status === TaskStatus.DONE || task.status === TaskStatus.CANCELLED;

  return (
    <div className="space-y-5">
      <Link
        href={`/projects/${id}/tasks`}
        className="text-sm font-bold uppercase text-muted hover:text-ink"
      >
        ← 返回任务列表
      </Link>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            <Badge color="muted">
              {PRIO_LABEL[task.priority] ?? task.priority}
            </Badge>
            {task.type && task.type !== "general" && (
              <Badge color="ink">{task.type}</Badge>
            )}
            {task.fromIssueId && <Badge color="grape">来自问题</Badge>}
          </div>

          <h2 className="heading text-2xl">{task.title}</h2>
          {task.description && (
            <p className="whitespace-pre-wrap text-sm">{task.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 border-t-2 border-paper pt-3 text-sm sm:grid-cols-4">
            <Meta
              label="领取者"
              value={task.claimedByRole ? `🤖 ${task.claimedByRole}` : "—"}
            />
            <Meta
              label="来源"
              value={task.createdVia === "API" ? "AI 创建" : "人工创建"}
            />
            <Meta label="创建者" value={task.createdByRole ?? "用户"} />
            <Meta
              label="创建时间"
              value={new Date(task.createdAt).toLocaleString("zh-CN")}
            />
          </div>

          {task.result && (
            <div className="border-2 border-ink bg-paper p-3">
              <p className="text-xs font-bold uppercase text-muted">
                结果 / 备注
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{task.result}</p>
            </div>
          )}

          {!done && <CancelButton projectId={id} taskId={taskId} />}
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="bg-surface">
            <h3 className="heading text-lg">事件时间线</h3>
          </CardHeader>
          <CardBody>
            <Timeline events={events} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="bg-sky text-white">
            <h3 className="heading text-lg">评论（{comments.length}）</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-muted">还没有评论</p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="border-b-2 border-paper pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <Badge color={c.authorType === "agent" ? "blue" : "accent"}>
                      {c.authorType === "agent" ? "🤖" : "👤"} {c.authorRole}
                    </Badge>
                    <span className="text-xs text-muted">
                      {new Date(c.createdAt).toLocaleString("zh-CN")}
                    </span>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm">{c.body}</p>
                </div>
              ))
            )}
            <CommentForm projectId={id} taskId={taskId} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
