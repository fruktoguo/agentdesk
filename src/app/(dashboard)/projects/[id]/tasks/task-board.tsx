"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/db";
import { NewTaskForm } from "./new-task-form";

const FILTERS = [
  { key: "ALL", label: "全部" },
  { key: "OPEN", label: "待领取" },
  { key: "CLAIMED", label: "进行中" },
  { key: "NEEDS_FIX", label: "待修复" },
  { key: "DONE", label: "已完成" },
] as const;

const PRIO: Record<string, { color: "accent" | "sun" | "muted"; label: string }> =
  {
    URGENT: { color: "accent", label: "紧急" },
    HIGH: { color: "sun", label: "高" },
    MEDIUM: { color: "muted", label: "中" },
    LOW: { color: "muted", label: "低" },
  };

export function TaskBoard({
  projectId,
  initialTasks,
}: {
  projectId: string;
  initialTasks: Task[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("ALL");

  // 订阅 SSE，任一事件触发服务端重新渲染
  useEffect(() => {
    const es = new EventSource(`/api/projects/${projectId}/events`);
    es.onmessage = () => router.refresh();
    return () => es.close();
  }, [projectId, router]);

  const filtered =
    filter === "ALL"
      ? initialTasks
      : initialTasks.filter((t) => t.status === filter);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count =
              f.key === "ALL"
                ? initialTasks.length
                : initialTasks.filter((t) => t.status === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-btn border-2 border-ink px-3 py-1.5 text-xs font-bold uppercase pressable",
                  filter === f.key ? "bg-ink text-white" : "bg-bg",
                )}
              >
                {f.label}{" "}
                <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
        <NewTaskForm projectId={projectId} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="暂无任务"
          description="新建任务后，AI agent 可通过 API 领取处理，看板会实时更新。"
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((t) => {
            const prio = PRIO[t.priority] ?? PRIO.MEDIUM;
            return (
              <Card key={t.id} hover className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={t.status} />
                      <Badge color={prio.color}>{prio.label}</Badge>
                      {t.type && t.type !== "general" && (
                        <span className="text-xs font-bold uppercase text-muted">
                          {t.type}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-bold">{t.title}</h3>
                    {t.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {t.claimedByRole && (
                      <Badge color="blue">🤖 {t.claimedByRole}</Badge>
                    )}
                    <p className="mt-1.5 text-xs text-muted">
                      {new Date(t.createdAt).toLocaleString("zh-CN", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
