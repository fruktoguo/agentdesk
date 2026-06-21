import { Bot, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { IssueStatus } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/feedback";
import { Icon } from "@/components/ui/icon";
import { IssueForm } from "./issue-form";
import { IssueActions } from "./issue-actions";
import type { Issue } from "@/lib/db";

const SEVERITY: Record<string, { color: "accent" | "sun" | "muted"; label: string }> = {
  URGENT: { color: "accent", label: "紧急" },
  HIGH: { color: "sun", label: "高" },
  MEDIUM: { color: "muted", label: "中" },
  LOW: { color: "muted", label: "低" },
};

function IssueCard({
  issue,
  projectId,
}: {
  issue: Issue;
  projectId: string;
}) {
  const sev = SEVERITY[issue.severity] ?? SEVERITY.MEDIUM;
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={sev.color}>{sev.label}</Badge>
            {issue.convertedTaskId && <Badge color="blue">已转任务</Badge>}
            {issue.resolvedByRole && <Badge color="grass">已解决</Badge>}
          </div>
          <h3 className="mt-2 font-bold">{issue.title}</h3>
          {issue.description && (
            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-muted">
              {issue.description}
            </p>
          )}
          <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted">
            {issue.createdByRole ? (
              <>
                <Icon icon={Bot} size={12} />
                {issue.createdByRole}
              </>
            ) : (
              <>
                <Icon icon={User} size={12} />
                人工
              </>
            )}
            <span aria-hidden>·</span>
            {new Date(issue.createdAt).toLocaleString("zh-CN")}
          </p>
        </div>
        {issue.status === IssueStatus.OPEN && (
          <IssueActions
            projectId={projectId}
            issueId={issue.id}
            converted={!!issue.convertedTaskId}
          />
        )}
      </div>
    </Card>
  );
}

export default async function IssuesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [openIssues, resolvedIssues] = await Promise.all([
    prisma.issue.findMany({
      where: { projectId: id, status: IssueStatus.OPEN },
      orderBy: { createdAt: "desc" },
    }),
    prisma.issue.findMany({
      where: { projectId: id, status: IssueStatus.RESOLVED },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <IssueForm projectId={id} />
      </div>

      {openIssues.length === 0 ? (
        <EmptyState
          title="没有待解决问题"
          description="发现 bug 或隐患时记录到这里，可一键转为任务让 AI 处理。"
        />
      ) : (
        <div className="grid gap-3">
          {openIssues.map((i, idx) => (
            <div
              key={i.id}
              className="enter-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <IssueCard issue={i} projectId={id} />
            </div>
          ))}
        </div>
      )}

      {resolvedIssues.length > 0 && (
        <div>
          <h3 className="heading mb-3 text-lg text-muted">已解决</h3>
          <div className="grid gap-3">
            {resolvedIssues.map((i, idx) => (
              <div
                key={i.id}
                className="enter-up"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <IssueCard issue={i} projectId={id} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
