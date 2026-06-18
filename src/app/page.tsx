import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { Card } from "@/components/ui/card";
import { MemphisShapes } from "@/components/ui/memphis-shapes";

const FEATURES = [
  {
    color: "bg-surface",
    title: "AI 自助领任务",
    desc: "Agent 通过 API token + 角色名，原子领取任务，无需人工分配。",
  },
  {
    color: "bg-sky text-white",
    title: "实时看板",
    desc: "谁领了、在修复、已完成——web 端 SSE 即时同步，尽收眼底。",
  },
  {
    color: "bg-accent text-white",
    title: "自由角色",
    desc: "角色名自报即用，多个 agent 并发协作，状态机驱动全流程。",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/projects");

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper">
      <MemphisShapes />

      <Container className="relative z-10">
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-btn border-2 border-ink bg-accent shadow-hard-sm" />
            <span className="heading text-xl">AgentDesk</span>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">登录</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">注册</Link>
            </Button>
          </div>
        </header>

        <section className="py-16 text-center sm:py-24">
          <span className="inline-block rounded-pill border-2 border-ink bg-surface px-3 py-1 text-xs font-bold uppercase tracking-wide">
            AI-first 任务调度
          </span>
          <h1 className="heading mt-6 text-5xl sm:text-7xl">
            AI 自己 <span className="bg-ink px-2 text-surface">领任务</span>
            <br />
            人类坐着 <span className="text-accent">看板</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-medium text-muted">
            一个给 AI agent 用的任务工单平台。人负责建项目、看大盘，
            AI 通过 token 抢任务、做修复，两边状态实时同步。
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">免费开始</Link>
            </Button>
            <Button asChild variant="blue" size="lg">
              <Link href="/login">我已有账号</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-5 pb-24 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} hover className="overflow-hidden">
              <div className={`h-3 border-b-2 border-ink ${f.color}`} />
              <div className="p-5">
                <h3 className="heading text-lg">{f.title}</h3>
                <p className="mt-2 text-sm font-medium text-muted">{f.desc}</p>
              </div>
            </Card>
          ))}
        </section>
      </Container>
    </main>
  );
}
