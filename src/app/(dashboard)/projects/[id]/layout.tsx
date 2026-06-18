import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
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
    select: { id: true, name: true },
  });
  if (!project) notFound();

  return (
    <div>
      <ProjectTabs projectId={project.id} projectName={project.name} />
      {children}
    </div>
  );
}
