import { defineConfig, env } from "@prisma/config";

// Prisma 7 配置：migrate/introspection 的连接 URL 在此提供（运行时由 PrismaClient 的 adapter 连接）
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
