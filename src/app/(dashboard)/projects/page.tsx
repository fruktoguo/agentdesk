import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
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
          {projects.map((p, i) => {
            const isOwner = p.ownerId === user.id;
            return (
              <Link key={p.id} href={`/projects/${p.id}`} className="block">
                <Card
                  hover
                  className="h-full overflow-hidden enter-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="border-b-2 border-ink bg-surface p-4">
                    <h3 className="heading truncate text-lg">{p.name}</h3>
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-muted">
                      {p.description || "暂无描述"}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <Badge color={isOwner ? "accent" : "muted"}>
                        {isOwner ? "拥有者" : `@${p.owner.name}`}
                      </Badge>
                      <div className="flex flex-wrap items-center justify-end gap-1.5 text-xs font-bold uppercase">
                        <span className="text-muted">{p._count.tasks} 任务</span>
                        {p._count.issues > 0 ? (
                          <Badge color="sun">
                            <Icon icon={AlertTriangle} size={12} />
                            {p._count.issues} 待解决
                          </Badge>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-grass">
                            <Icon icon={CheckCircle2} size={12} />
                            无问题
                          </span>
                        )}
                      </div>
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
