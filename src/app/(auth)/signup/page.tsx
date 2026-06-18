import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <Card>
      <CardHeader className="bg-surface">
        <h1 className="heading text-2xl">创建账号</h1>
        <p className="mt-1 text-sm font-medium text-muted">
          注册后即可创建项目并接入 AI
        </p>
      </CardHeader>
      <CardBody>
        <SignupForm />
        <p className="mt-5 text-sm font-medium">
          已有账号？{" "}
          <Link
            href="/login"
            className="font-bold underline underline-offset-2"
          >
            去登录
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
