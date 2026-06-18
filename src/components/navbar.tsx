import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";

export function Navbar({ user }: { user: { name: string; email: string } }) {
  return (
    <header className="border-b-2 border-ink bg-bg">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/projects" className="flex items-center gap-2">
            <div className="size-8 rounded-btn border-2 border-ink bg-accent shadow-hard-sm" />
            <span className="heading text-lg">AgentDesk</span>
          </Link>
          <nav className="hidden gap-1 text-sm font-bold uppercase sm:flex">
            <Link
              href="/projects"
              className="rounded-btn border-2 border-transparent px-3 py-1.5 transition hover:border-ink hover:bg-surface"
            >
              项目
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold leading-tight">{user.name}</p>
            <p className="text-xs leading-tight text-muted">{user.email}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="登出"
              className="pressable flex size-10 items-center justify-center rounded-btn border-2 border-ink bg-ink font-bold text-white"
            >
              ⏏
            </button>
          </form>
        </div>
      </Container>
    </header>
  );
}
