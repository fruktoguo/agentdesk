"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Spinner } from "@/components/ui/feedback";
import type { ActionResult } from "@/lib/types";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {
    ok: false,
  } as ActionResult);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" name="email" type="email" autoComplete="email" />
        <FieldError>{state.errors?.email?.[0]}</FieldError>
      </div>
      <div>
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
        <FieldError>{state.errors?.password?.[0]}</FieldError>
      </div>
      {state.error && (
        <p className="border-2 border-ink bg-accent px-3 py-2 text-sm font-bold text-white">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Spinner className="size-4 border-white border-t-transparent" />
            登录中…
          </>
        ) : (
          "登录"
        )}
      </Button>
    </form>
  );
}
