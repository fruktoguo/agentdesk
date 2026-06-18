import type { Task, Comment, Issue } from "@/lib/db";

/** 任务对外序列化 */
export function serializeTask(t: Task) {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    type: t.type,
    priority: t.priority,
    status: t.status,
    claimedByRole: t.claimedByRole,
    claimedAt: t.claimedAt,
    result: t.result,
    fromIssueId: t.fromIssueId,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export function serializeComment(c: Comment) {
  return {
    id: c.id,
    body: c.body,
    authorType: c.authorType,
    authorRole: c.authorRole,
    createdAt: c.createdAt,
  };
}

export function serializeIssue(i: Issue) {
  return {
    id: i.id,
    title: i.title,
    description: i.description,
    status: i.status,
    severity: i.severity,
    createdByRole: i.createdByRole,
    resolvedAt: i.resolvedAt,
    resolvedByRole: i.resolvedByRole,
    convertedTaskId: i.convertedTaskId,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  };
}
