import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

const TYPE_COLOR: Record<string, string> = {
  task_created: "bg-sky",
  task_claimed: "bg-surface",
  task_released: "bg-paper",
  task_needs_fix: "bg-sun",
  task_completed: "bg-grass",
  task_cancelled: "bg-ink",
  task_commented: "bg-accent",
  issue_created: "bg-grape",
  issue_resolved: "bg-grass",
  issue_converted: "bg-sky",
  planning_updated: "bg-surface",
  token_created: "bg-accent",
  token_revoked: "bg-ink",
};

interface TimelineEvent {
  id: string;
  type: string;
  actorType: string;
  actorRole: string | null;
  summary?: string | null;
  createdAt: Date | string;
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted">暂无事件记录</p>;
  }

  return (
    <ol>
      {events.map((e, i) => {
        const isLast = i === events.length - 1;
        return (
          <li
            key={e.id}
            className={cn("relative flex gap-3", isLast ? "pb-0" : "pb-5")}
          >
            {!isLast && (
              <span className="absolute left-[11px] top-6 h-[calc(100%-1rem)] w-0.5 bg-ink" />
            )}
            <span
              className={cn(
                "z-10 mt-0.5 size-6 shrink-0 rounded-full border-2 border-ink",
                TYPE_COLOR[e.type] ?? "bg-paper",
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-bold">{e.summary ?? e.type}</p>
                <span className="shrink-0 text-xs text-muted">
                  {new Date(e.createdAt).toLocaleString("zh-CN")}
                </span>
              </div>
              <p className="flex items-center gap-1 text-xs text-muted">
                <Icon icon={e.actorType === "agent" ? Bot : User} size={12} />
                {e.actorRole ?? "未知"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
