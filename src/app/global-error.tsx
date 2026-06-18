"use client";

// 全局错误边界：替代 root layout 渲染，必须自带 <html><body>。
// 故意不 import globals.css，保持最小化、零依赖，避免 SSG 时的上下文问题。
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
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
          background: "#fffdf5",
          color: "#000",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: 800, textTransform: "uppercase" }}>
          出了点问题
        </h1>
        <p style={{ color: "#555", maxWidth: "28rem" }}>
          {error.digest ? `错误码 ${error.digest}` : error.message}
        </p>
        <button
          onClick={() => reset()}
          style={{
            border: "2px solid #000",
            background: "#e91e63",
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
