import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // WSL2 / 多项目常驻环境下 inotify watch 易耗尽（ENOSPC），改用轮询监听
  watchOptions: {
    pollIntervalMs: 1000,
  },
  typescript: {
    // Next 16.2.9 对 route-group layout 的类型校验器存在误报；
    // 代码类型由独立的 `pnpm typecheck`（tsc --noEmit）保证
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
