import { z } from "zod";

// ───────────────────────── 认证 ─────────────────────────
export const signupSchema = z.object({
  name: z.string().min(2, "昵称至少 2 个字符").max(50).trim(),
  email: z.email("请输入有效邮箱").trim().toLowerCase(),
  password: z.string().min(8, "密码至少 8 位").max(100),
});

export const loginSchema = z.object({
  email: z.email("请输入有效邮箱").trim().toLowerCase(),
  password: z.string().min(1, "请输入密码"),
});

// ───────────────────────── 项目 ─────────────────────────
export const projectCreateSchema = z.object({
  name: z.string().min(1, "项目名不能为空").max(100).trim(),
  description: z.string().max(2000).optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial();

// ───────────────────────── 任务 ─────────────────────────
export const taskCreateSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200).trim(),
  description: z.string().max(10000).optional(),
  type: z.string().max(50).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

export const commentCreateSchema = z.object({
  body: z.string().min(1, "评论不能为空").max(5000).trim(),
});

// ───────────────────────── AI API 入参 ─────────────────────────
export const apiTaskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  type: z.string().max(50).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

export const apiNeedsFixSchema = z.object({
  reason: z.string().max(2000).optional(),
  result: z.string().max(5000).optional(),
});

export const apiCompleteSchema = z.object({
  result: z.string().max(5000).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ───────────────────────── AI API：问题 / 规划 ─────────────────────────
export const apiIssueCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10000).optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

export const apiPlanningUpdateSchema = z.object({
  planning: z.string().max(100000),
});

// web：问题 / 规划
export const issueCreateSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200).trim(),
  description: z.string().max(10000).optional(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

export const planningUpdateSchema = z.object({
  planning: z.string().max(100000),
});
