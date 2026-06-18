import { prisma } from "@/lib/prisma";
import { TokenManager } from "./token-manager";

export default async function TokensPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tokens = await prisma.projectToken.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });

  return <TokenManager projectId={id} tokens={tokens} />;
}
