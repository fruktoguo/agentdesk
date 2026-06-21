"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Icon } from "./icon";

type Theme = "light" | "dark";

/**
 * 明暗切换按钮。
 * - 写 cookie（max-age 1 年）持久化，防闪烁脚本（layout.tsx）在首帧读取
 * - 切 <html> 上的 .dark 类，所有语义 token 自动跟随
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.cookie = `theme=${next};path=/;max-age=31536000;samesite=lax`;
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "切换到亮色模式" : "切换到暗色模式"}
      title={theme === "dark" ? "亮色模式" : "暗色模式"}
      className="pressable flex size-10 items-center justify-center rounded-btn border-2 border-ink bg-bg"
    >
      {/* mounted 前固定渲染 Moon，避免 SSR/CSR 水合不一致 */}
      <Icon icon={mounted && theme === "dark" ? Sun : Moon} size={18} />
    </button>
  );
}
