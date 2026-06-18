import { NextResponse, type NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

// Next.js 16: middleware 改名为 proxy。此处只做乐观鉴权（读 cookie），
// 真正的权限校验在 DAL / Route Handler 内进行。
export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // /api/** 由各路由自行鉴权（AI token 通道单独处理），proxy 不介入
  if (path.startsWith("/api/")) return NextResponse.next();

  const isAuthPage = path === "/login" || path === "/signup";
  const isPublic = path === "/" || isAuthPage;

  const session = await decrypt(req.cookies.get(SESSION_COOKIE)?.value);
  const isAuthed = !!session?.userId;

  // 未登录访问受保护页 → 跳登录，并带上 next 以便登录后回跳
  if (!isAuthed && !isPublic) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // 已登录访问登录/注册页 → 跳到项目列表
  if (isAuthed && isAuthPage) {
    return NextResponse.redirect(new URL("/projects", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // 排除静态资源、API 与带后缀的文件；其余路径都走 proxy
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
