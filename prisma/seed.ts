import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Priority,
  TaskStatus,
} from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type SeedTask = {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  claimedByRole?: string;
};

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@agentdesk.dev" },
    update: {},
    create: {
      email: "demo@agentdesk.dev",
      name: "Demo",
      passwordHash: password,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "demo-project" },
    update: {},
    create: {
      id: "demo-project",
      name: "演示项目",
      description: "体验 AI 任务调度的示例项目，登录后可在此创建任务、生成 token 让 AI 接入。",
      ownerId: user.id,
    },
  });

  const tasks: SeedTask[] = [
    {
      title: "审查用户认证模块",
      description: "检查 session 加密与密码哈希实现是否安全。",
      priority: Priority.HIGH,
      status: TaskStatus.OPEN,
    },
    {
      title: "修复 SSE 断线重连",
      description: "EventSource 断开后应自动重连，避免漏事件。",
      priority: Priority.URGENT,
      status: TaskStatus.OPEN,
    },
    {
      title: "优化任务列表查询",
      description: "为高频查询加索引，消除潜在 N+1。",
      priority: Priority.MEDIUM,
      status: TaskStatus.CLAIMED,
      claimedByRole: "perf-bot",
    },
    {
      title: "补充 API 接口文档",
      description: "为 /api/agent 编写接口说明。",
      priority: Priority.LOW,
      status: TaskStatus.DONE,
      claimedByRole: "docs-bot",
    },
  ];

  for (const t of tasks) {
    await prisma.task.create({
      data: {
        projectId: project.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        claimedByRole: t.claimedByRole ?? null,
        createdVia: "WEB",
        createdById: user.id,
      },
    });
  }

  console.log("✓ Seed 完成");
  console.log("  登录账号: demo@agentdesk.dev / password123");
  console.log("  示例项目: demo-project");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
