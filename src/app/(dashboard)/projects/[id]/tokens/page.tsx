import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { TokenManager } from "./token-manager";

export default async function TokensPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, tokens] = await Promise.all([
    getCurrentUser(),
    prisma.projectToken.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!user) redirect("/login");
  const project = await prisma.project.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!project || project.ownerId !== user.id) redirect(`/projects/${id}`);

  return <TokenManager projectId={id} tokens={tokens} />;
}
