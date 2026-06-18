import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";
import { DeleteForm } from "./delete-form";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, name: true, description: true, planning: true, ownerId: true },
  });
  if (!project) notFound();
  if (project.ownerId !== user.id) redirect(`/projects/${id}`);

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader className="bg-surface">
          <h2 className="heading text-xl">项目信息</h2>
        </CardHeader>
        <CardBody>
          <SettingsForm
            projectId={project.id}
            name={project.name}
            description={project.description}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="bg-accent text-white">
          <h2 className="heading text-xl">危险操作</h2>
        </CardHeader>
        <CardBody>
          <p className="mb-3 text-sm font-medium text-muted">
            删除项目将永久移除其下所有任务、问题、事件与 token，不可恢复。仅拥有者可执行。
          </p>
          <DeleteForm projectId={project.id} />
        </CardBody>
      </Card>
    </div>
  );
}
