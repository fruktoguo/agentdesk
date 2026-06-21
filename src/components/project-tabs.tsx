"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

type PreviewItem = { id: string; title: string; level: string };

type TabCounts = {
  openTasks: number;
  needsFix: number;
  openIssues: number;
};

type TabPreview = {
  needsFixTasks: PreviewItem[];
  openIssues: PreviewItem[];
};

type Tab = {
  href: string;
  label: string;
  ownerOnly?: boolean;
};

const TABS: Tab[] = [
  { href: "", label: "概览" },
  { href: "/planning", label: "规划" },
  { href: "/tasks", label: "任务" },
  { href: "/issues", label: "问题" },
  { href: "/tokens", label: "Token", ownerOnly: true },
  { href: "/settings", label: "设置", ownerOnly: true },
];

const LEVEL: Record<string, { cls: string; label: string }> = {
  URGENT: { cls: "bg-accent text-white", label: "紧急" },
  HIGH: { cls: "bg-sun text-ink", label: "高" },
  MEDIUM: { cls: "bg-paper text-muted", label: "中" },
  LOW: { cls: "bg-paper text-muted", label: "低" },
};

/** 标签上的计数徽章 */
function TabBadge({
  count,
  tone,
  label,
}: {
  count: number;
  tone: "alert" | "neutral";
  label: string;
}) {
  if (count <= 0) return null;
  return (
    <span
      aria-label={label}
      className={cn(
        "ml-1.5 inline-flex min-w-5 items-center justify-center rounded-pill border-2 border-ink px-1.5 text-[11px] font-bold leading-none",
        tone === "alert" ? "bg-sun text-ink pulse-alert" : "bg-paper text-muted",
      )}
    >
      {count}
    </span>
  );
}

/** hover 预览浮层：直接列出具体的待修复任务 / 未解决问题标题 */
function PreviewPopover({
  base,
  icon,
  heading,
  emptyText,
  hrefAll,
  items,
  itemHref,
  total,
}: {
  base: string;
  icon: typeof Wrench;
  heading: string;
  emptyText: string;
  hrefAll: string;
  items: PreviewItem[];
  itemHref: (it: PreviewItem) => string;
  total: number;
}) {
  return (
    <div className="absolute left-0 top-full z-50 hidden w-72 pt-2 group-hover:block">
      <div className="rounded-card border-2 border-ink bg-bg p-3 shadow-hard-lg">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted">
          <Icon icon={icon} size={14} />
          {heading}
        </p>
        {items.length === 0 ? (
          <p className="mt-2 text-sm font-medium text-muted">{emptyText}</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {items.map((it) => {
              const lv = LEVEL[it.level] ?? LEVEL.MEDIUM;
              return (
                <li key={it.id}>
                  <Link
                    href={itemHref(it)}
                    className="flex items-center gap-2 rounded-btn px-1 py-0.5 normal-case hover:bg-paper"
                  >
                    <span
                      className={cn(
                        "shrink-0 rounded-pill border-2 border-ink px-1.5 text-[10px] font-bold leading-tight",
                        lv.cls,
                      )}
                    >
                      {lv.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">
                      {it.title}
                    </span>
                  </Link>
                </li>
              );
            })}
            {total > items.length && (
              <li className="pt-1">
                <Link
                  href={hrefAll}
                  className="text-xs font-bold uppercase text-accent hover:underline"
                >
                  查看全部 {total} 项 →
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export function ProjectTabs({
  projectId,
  projectName,
  isOwner,
  counts,
  preview,
}: {
  projectId: string;
  projectName: string;
  isOwner: boolean;
  counts: TabCounts;
  preview: TabPreview;
}) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  const badgeFor = (href: string) => {
    if (href === "/tasks") {
      return (
        <>
          <TabBadge
            count={counts.needsFix}
            tone="alert"
            label={`${counts.needsFix} 个任务待修复`}
          />
          <TabBadge
            count={counts.openTasks}
            tone="neutral"
            label={`${counts.openTasks} 个任务待领取`}
          />
        </>
      );
    }
    if (href === "/issues") {
      return (
        <TabBadge
          count={counts.openIssues}
          tone="alert"
          label={`${counts.openIssues} 个问题待解决`}
        />
      );
    }
    return null;
  };

  // 只有有内容可预览的 tab 才挂浮层
  const previewFor = (href: string) => {
    if (href === "/tasks" && counts.needsFix > 0) {
      return (
        <PreviewPopover
          base={base}
          icon={Wrench}
          heading={`待修复任务（${counts.needsFix}）`}
          emptyText="无待修复任务"
          hrefAll={`${base}/tasks`}
          items={preview.needsFixTasks}
          itemHref={(it) => `${base}/tasks/${it.id}`}
          total={counts.needsFix}
        />
      );
    }
    if (href === "/issues" && counts.openIssues > 0) {
      return (
        <PreviewPopover
          base={base}
          icon={AlertTriangle}
          heading={`未解决问题（${counts.openIssues}）`}
          emptyText="无未解决问题"
          hrefAll={`${base}/issues`}
          items={preview.openIssues}
          itemHref={() => `${base}/issues`}
          total={counts.openIssues}
        />
      );
    }
    return null;
  };

  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">
        项目
      </p>
      <h1 className="heading text-3xl sm:text-4xl">{projectName}</h1>

      <nav className="mt-4 flex flex-wrap gap-1 border-b-2 border-ink">
        {TABS.filter((t) => !t.ownerOnly || isOwner).map((t) => {
          const href = base + t.href;
          const active = pathname === href;
          const popover = previewFor(t.href);
          return (
            <div key={t.href} className="group relative">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-[2px] flex items-center whitespace-nowrap rounded-t-btn border-2 border-b-4 px-4 py-2 text-sm font-bold uppercase transition",
                  active
                    ? "border-ink border-b-accent bg-surface text-ink shadow-hard-sm"
                    : "border-transparent text-muted hover:border-ink hover:bg-sky hover:text-white",
                )}
              >
                {t.label}
                {badgeFor(t.href)}
              </Link>
              {popover}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
