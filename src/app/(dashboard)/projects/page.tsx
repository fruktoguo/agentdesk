import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/feedback";
import { SectionTitle } from "@/components/ui/layout";
import { NewProjectForm } from "./new-project-form";

export default async function ProjectsPage() {
  const user = await requireUser();

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { name: true } },
      _count: { select: { tasks: true, issues: true } },
    },
  });

  return (
    <div>
      <SectionTitle
        title="项目"
        description="所有项目共享可见；你是创建者的项目可编辑与删除。"
        action={<NewProjectForm />}
      />

      {projects.length === 0 ? (
        <EmptyState
          title="还没有项目"
          description="新建第一个项目，开始让 AI 帮你跑任务。"
          action={<NewProjectForm />}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const isOwner = p.ownerId === user.id;
            return (
              <Link key={p.id} href={`/projects/${p.id}`} className="block">
                <Card hover className="h-full overflow-hidden">
                  <div className="border-b-2 border-ink bg-surface p-4">
                    <h3 className="heading truncate text-lg">{p.name}</h3>
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-muted">
                      {p.description || "暂无描述"}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge color={isOwner ? "accent" : "muted"}>
                        {isOwner ? "拥有者" : `@${p.owner.name}`}
                      </Badge>
                      <span className="text-xs font-bold uppercase text-muted">
                        {p._count.tasks} 任务 · {p._count.issues} 问题
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
