"use client";

// 全局错误边界：替代 root layout 渲染，必须自带 <html><body>。
// 故意不 import globals.css，保持最小化、零依赖，避免 SSG 时的上下文问题。
// 内联最小 token + prefers-color-scheme，让错误页也跟随系统暗色。
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <style>{`:root{--bg:#fffdf5;--ink:#000;--muted:#555;--accent:#e91e63}@media(prefers-color-scheme:dark){:root{--bg:#15131a;--ink:#f5f1e8;--muted:#a8a39a;--accent:#ec2d6e}}`}</style>
      </head>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          background: "var(--bg)",
          color: "var(--ink)",
          textAlign: "center",
        }}
      >
        <h1
          style={{ fontSize: "2rem", fontWeight: 800, textTransform: "uppercase" }}
        >
          出了点问题
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: "28rem" }}>
          {error.digest ? `错误码 ${error.digest}` : error.message}
        </p>
        <button
          onClick={() => reset()}
          style={{
            border: "2px solid var(--ink)",
            background: "var(--accent)",
            color: "#fff",
            padding: "0.6rem 1.4rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          重试
        </button>
      </body>
    </html>
  );
}
