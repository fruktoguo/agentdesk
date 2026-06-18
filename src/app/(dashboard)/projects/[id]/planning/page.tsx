import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PlanningForm } from "./planning-form";

export default async function PlanningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, planning: true },
  });
  if (!project) notFound();

  return <PlanningForm projectId={project.id} initialPlanning={project.planning ?? ""} />;
}
