import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="bg-sky text-white">
        <h1 className="heading text-2xl">欢迎回来</h1>
        <p className="mt-1 text-sm font-medium text-white/80">
          登录进入你的任务看板
        </p>
      </CardHeader>
      <CardBody>
        <LoginForm />
        <p className="mt-5 text-sm font-medium">
          还没账号？{" "}
          <Link
            href="/signup"
            className="font-bold underline underline-offset-2"
          >
            去注册
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
