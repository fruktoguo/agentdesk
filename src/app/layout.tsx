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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={spaceGrotesk.variable}>
      <body className="min-h-screen bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
