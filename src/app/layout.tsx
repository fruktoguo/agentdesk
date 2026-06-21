import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "AgentDesk — AI Agent 研发协作平台", template: "%s · AgentDesk" },
  description: "面向 AI Agent 的研发任务调度与人类观察控制台",
};

// 防 FOUC：在 hydration 前同步执行，根据 cookie（用户选择）或系统偏好
// 设置 <html> 上的 .dark，避免首帧亮色闪烁。
const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|; )theme=(light|dark)/);var t=m?m[1]:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={spaceGrotesk.variable}
      // ThemeToggle 在 client 改 class，suppress 避免水合告警
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
