"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Container } from "@/components/ui/layout";
import { Icon } from "@/components/ui/icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar({ user }: { user: { name: string; email: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-bg">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/projects" className="flex items-center gap-2">
            <div className="size-8 rounded-btn border-2 border-ink bg-accent shadow-hard-sm" />
            <span className="heading text-lg">AgentDesk</span>
          </Link>
          {/* 桌面导航 */}
          <nav className="hidden gap-1 text-sm font-bold uppercase sm:flex">
            <Link
              href="/projects"
              className="rounded-btn border-2 border-transparent px-3 py-1.5 transition hover:border-ink hover:bg-surface"
            >
              项目
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {/* 桌面：用户信息 + 登出 */}
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold leading-tight">{user.name}</p>
            <p className="text-xs leading-tight text-muted">{user.email}</p>
          </div>
          <form action={logoutAction} className="hidden sm:block">
            <button
              type="submit"
              aria-label="登出"
              title="登出"
              className="pressable flex size-10 items-center justify-center rounded-btn border-2 border-ink bg-ink text-white"
            >
              <Icon icon={LogOut} size={18} />
            </button>
          </form>
          {/* 移动端汉堡 */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "关闭菜单" : "打开菜单"}
            aria-expanded={open}
            className="pressable flex h-11 w-11 items-center justify-center rounded-btn border-2 border-ink bg-bg sm:hidden"
          >
            <Icon icon={open ? X : Menu} size={20} />
          </button>
        </div>
      </Container>

      {/* 移动端下拉菜单 */}
      {open && (
        <div className="border-t-2 border-ink bg-bg sm:hidden">
          <Container className="space-y-3 py-4">
            <nav className="flex flex-col gap-1 text-sm font-bold uppercase">
              <Link
                href="/projects"
                onClick={() => setOpen(false)}
                className="rounded-btn border-2 border-transparent px-3 py-2 transition hover:border-ink hover:bg-surface"
              >
                项目
              </Link>
            </nav>
            <div className="border-t-2 border-paper pt-3">
              <p className="text-sm font-bold leading-tight">{user.name}</p>
              <p className="text-xs leading-tight text-muted">{user.email}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="pressable flex w-full items-center justify-center gap-2 rounded-btn border-2 border-ink bg-ink px-3 py-2 font-bold uppercase text-white"
              >
                <Icon icon={LogOut} size={16} />
                登出
              </button>
            </form>
          </Container>
        </div>
      )}
    </header>
  );
}
