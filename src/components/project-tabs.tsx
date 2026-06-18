"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "", label: "概览" },
  { href: "/planning", label: "规划" },
  { href: "/tasks", label: "任务" },
  { href: "/issues", label: "问题" },
  { href: "/tokens", label: "Token" },
  { href: "/settings", label: "设置" },
];

export function ProjectTabs({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">
        项目
      </p>
      <h1 className="heading text-3xl sm:text-4xl">{projectName}</h1>

      <nav className="mt-4 flex flex-wrap gap-1 overflow-x-auto border-b-2 border-ink">
        {TABS.map((t) => {
          const href = base + t.href;
          const active = pathname === href;
          return (
            <Link
              key={t.href}
              href={href}
              className={cn(
                "-mb-[2px] whitespace-nowrap border-b-4 px-4 py-2 text-sm font-bold uppercase transition",
                active
                  ? "border-accent"
                  : "border-transparent text-muted hover:text-ink",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
