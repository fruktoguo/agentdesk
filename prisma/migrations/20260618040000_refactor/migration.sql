-- 重构：token 绑定项目 / 移除成员 / 新增 Issue 与统一 Event / 规划字段

-- 新增 enum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'RESOLVED');

-- 新增表：Issue
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "severity" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "createdVia" "Source" NOT NULL DEFAULT 'WEB',
    "createdById" TEXT,
    "createdByRole" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedByRole" TEXT,
    "convertedTaskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Issue_projectId_status_idx" ON "Issue"("projectId", "status");
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 新增表：Event（统一留档）
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "taskId" TEXT,
    "issueId" TEXT,
    "actorType" TEXT NOT NULL,
    "actorRole" TEXT,
    "summary" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Event_projectId_createdAt_idx" ON "Event"("projectId", "createdAt");
CREATE INDEX "Event_taskId_idx" ON "Event"("taskId");
CREATE INDEX "Event_issueId_idx" ON "Event"("issueId");
ALTER TABLE "Event" ADD CONSTRAINT "Event_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 扩展 Project / Task
ALTER TABLE "Project" ADD COLUMN "planning" TEXT;
ALTER TABLE "Task" ADD COLUMN "fromIssueId" TEXT;

-- 移除成员体系与旧任务事件表
DROP TABLE "ProjectMember";
DROP TABLE "TaskEvent";
DROP TYPE "MemberRole";
