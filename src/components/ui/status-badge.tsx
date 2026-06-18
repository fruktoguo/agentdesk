import { Badge } from "./badge";

type BadgeColor = Parameters<typeof Badge>[0]["color"];

const STATUS_MAP: Record<string, { color: BadgeColor; label: string }> = {
  OPEN: { color: "blue", label: "待领取" },
  CLAIMED: { color: "yellow", label: "进行中" },
  NEEDS_FIX: { color: "sun", label: "待修复" },
  DONE: { color: "grass", label: "已完成" },
  CANCELLED: { color: "muted", label: "已取消" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] ?? { color: "ink" as BadgeColor, label: status };
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
}
