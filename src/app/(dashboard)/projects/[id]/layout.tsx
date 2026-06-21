import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { TaskStatus, IssueStatus } from "@/lib/db";
import { ProjectTabs } from "@/components/project-tabs";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, name: true, ownerId: true },
  });
  if (!project) notFound();

  const isOwner = project.ownerId === user.id;

  // 各 tab 的预览数据：计数 + 关键条目标题，让标签栏 hover 即可看到具体的问题/错误
  const [openTasks, needsFixCount, needsFixTasks, openIssueCount, openIssues] =
    await Promise.all([
      prisma.task.count({
        where: { projectId: id, status: TaskStatus.OPEN },
      }),
      prisma.task.count({
        where: { projectId: id, status: TaskStatus.NEEDS_FIX },
      }),
      prisma.task.findMany({
        where: { projectId: id, status: TaskStatus.NEEDS_FIX },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, priority: true },
      }),
      prisma.issue.count({
        where: { projectId: id, status: IssueStatus.OPEN },
      }),
      prisma.issue.findMany({
        where: { projectId: id, status: IssueStatus.OPEN },
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        take: 5,
        select: { id: true, title: true, severity: true },
      }),
    ]);

  return (
    <div>
      <ProjectTabs
        projectId={project.id}
        projectName={project.name}
        isOwner={isOwner}
        counts={{
          openTasks,
          needsFix: needsFixCount,
          openIssues: openIssueCount,
        }}
        preview={{
          needsFixTasks: needsFixTasks.map((t) => ({
            id: t.id,
            title: t.title,
            level: t.priority,
          })),
          openIssues: openIssues.map((i) => ({
            id: i.id,
            title: i.title,
            level: i.severity,
          })),
        }}
      />
      {children}
    </div>
  );
}
