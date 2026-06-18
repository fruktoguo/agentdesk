import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { PlanningForm } from "./planning-form";

export default async function PlanningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, planning: true, ownerId: true },
  });
  if (!project) notFound();

  const isOwner = project.ownerId === user.id;

  return (
    <PlanningForm
      projectId={project.id}
      initialPlanning={project.planning ?? ""}
      canEdit={isOwner}
    />
  );
}
