import "server-only";
import { prisma } from "@/lib/prisma";
import { IssueStatus, Priority, Source, TaskStatus } from "@/lib/db";
import { recordEvent, type Actor } from "@/lib/event-service";

export interface IssueCreateInput {
  title: string;
  description?: string;
  severity?: Priority;
}

// ───────────────────────── 创建问题 ─────────────────────────
export async function createIssue(
  projectId: string,
  input: IssueCreateInput,
  actor: Actor,
  via: Source,
) {
  const issue = await prisma.issue.create({
    data: {
      projectId,
      title: input.title,
      description: input.description,
      severity: input.severity ?? Priority.MEDIUM,
      createdVia: via,
      createdById: actor.userId,
      createdByRole: actor.type === "agent" ? actor.role : null,
    },
  });
  await recordEvent({
    projectId,
    type: "issue_created",
    issueId: issue.id,
    actor,
    summary: `记录问题「${issue.title}」`,
  });
  return issue;
}

// ───────────────────────── 标记解决 ─────────────────────────
export async function resolveIssue(issueId: string, actor: Actor) {
  const r = await prisma.issue.updateMany({
    where: { id: issueId, status: IssueStatus.OPEN },
    data: {
      status: IssueStatus.RESOLVED,
      resolvedAt: new Date(),
      resolvedByRole: actor.role,
    },
  });
  if (r.count === 0) return { ok: false as const, code: "NOT_OPEN" };
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  await recordEvent({
    projectId: issue!.projectId,
    type: "issue_resolved",
    issueId,
    actor,
    summary: `${actor.role} 解决了问题「${issue!.title}」`,
  });
  return { ok: true as const, issue };
}

// ───────────────────────── 问题转任务 ─────────────────────────
export async function convertIssueToTask(issueId: string, actor: Actor) {
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) return { ok: false as const, code: "NOT_FOUND" };
  if (issue.convertedTaskId) {
    return { ok: false as const, code: "ALREADY_CONVERTED" };
  }

  const task = await prisma.task.create({
    data: {
      projectId: issue.projectId,
      title: issue.title,
      description: issue.description,
      priority: issue.severity,
      status: TaskStatus.OPEN,
      createdVia: Source.API,
      createdByRole: actor.role,
      fromIssueId: issue.id,
    },
  });
  await prisma.issue.update({
    where: { id: issueId },
    data: { convertedTaskId: task.id },
  });
  await recordEvent({
    projectId: issue.projectId,
    type: "issue_converted",
    issueId,
    taskId: task.id,
    actor,
    summary: `问题「${issue.title}」转为任务`,
  });
  return { ok: true as const, task };
}
