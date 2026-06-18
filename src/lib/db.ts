// 统一数据库入口：prisma 实例 + 生成的类型与枚举
export { prisma } from "@/lib/prisma";

export type {
  User,
  Project,
  ProjectToken,
  Task,
  Issue,
  Event,
  Comment,
} from "@/generated/prisma/client";

export { TaskStatus, Priority, Source, IssueStatus } from "@/generated/prisma/client";
