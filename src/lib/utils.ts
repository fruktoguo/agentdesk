import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** 合并 Tailwind class，自动去重冲突 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 取对象里值为真的键，拼成 class */
export function cx(obj: Record<string, boolean | undefined | null>): string {
  return twMerge(clsx(obj));
}

/**
 * 将返回任意值的 server action 适配为 <form action>，
 * React 的 form action 类型要求返回 void，实际返回值会被忽略。
 */
export function formAction(
  action: unknown,
): (formData: FormData) => Promise<void> {
  return action as (formData: FormData) => Promise<void>;
}
