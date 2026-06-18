import { prisma } from "@/lib/prisma";
import { TaskBoard } from "./task-board";

export default async function TasksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tasks = await prisma.task.findMany({
    where: { projectId: id },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return <TaskBoard projectId={id} initialTasks={tasks} />;
}
