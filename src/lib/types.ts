// 通用返回类型：用于 Server Actions
export type FieldErrors = Record<string, string[]>;

export type ActionResult = {
  ok: boolean;
  error?: string;
  errors?: FieldErrors;
};

// 任务事件类型（TaskEvent.type 取值）
export const TaskEventType = {
  CREATED: "created",
  CLAIMED: "claimed",
  RELEASED: "released",
  NEEDS_FIX: "needs_fix",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  COMMENTED: "commented",
} as const;

export type TaskEventTypeValue = (typeof TaskEventType)[keyof typeof TaskEventType];

// 行动者类型
export const ActorType = {
  USER: "user",
  AGENT: "agent",
} as const;
