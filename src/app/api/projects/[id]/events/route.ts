import { getCurrentUser } from "@/lib/dal";
import { subscribeProject } from "@/lib/realtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** SSE 事件流：登录用户即可订阅项目事件 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      const send = (data: unknown) =>
        controller.enqueue(enc.encode(`data: ${JSON.stringify(data)}\n\n`));

      send({ type: "connected" });

      const unsub = subscribeProject(id, (e) => send(e));

      const ping = setInterval(() => {
        try {
          controller.enqueue(enc.encode(": ping\n\n"));
        } catch {
          /* 已关闭 */
        }
      }, 15000);

      const cleanup = () => {
        unsub();
        clearInterval(ping);
        try {
          controller.close();
        } catch {
          /* 已关闭 */
        }
      };
      req.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
