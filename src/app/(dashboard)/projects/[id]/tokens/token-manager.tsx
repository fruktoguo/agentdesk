"use client";

import { useActionState } from "react";
import { createTokenAction, revokeTokenAction } from "@/app/actions/tokens";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/feedback";
import { Alert } from "@/components/ui/alert";
import { CodeBlock } from "@/components/ui/code-block";
import { DestructiveAction } from "@/components/ui/destructive-action";
import type { ActionResult } from "@/lib/types";
import type { ProjectToken } from "@/lib/db";

const CURL_SAMPLE = `# 智能领取下一个任务（按优先级）
curl -X POST HOST/api/agent/tasks/claim-next \\
  -H "Authorization: Bearer <你的token>" \\
  -H "X-Agent-Role: code-reviewer"

# 创建任务
curl -X POST HOST/api/agent/tasks \\
  -H "Authorization: Bearer <你的token>" \\
  -H "X-Agent-Role: code-reviewer" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"审查登录模块"}'

# 完成任务
curl -X POST HOST/api/agent/tasks/<taskId>/complete \\
  -H "Authorization: Bearer <你的token>" \\
  -H "X-Agent-Role: code-reviewer"`;

export function TokenManager({
  projectId,
  tokens,
}: {
  projectId: string;
  tokens: ProjectToken[];
}) {
  const [state, action, pending] = useActionState(
    createTokenAction.bind(null, projectId),
    { ok: false } as ActionResult & { token?: string },
  );
  const newToken = state.token;

  return (
    <div className="max-w-3xl space-y-6">
      {/* 生成 */}
      <Card>
        <CardHeader className="bg-surface">
          <h2 className="heading text-xl">生成新 Token</h2>
        </CardHeader>
        <CardBody>
          <form action={action} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <Label htmlFor="tname">名称（便于识别）</Label>
              <Input id="tname" name="name" placeholder="例如 prod-bot" />
              <FieldError>{state.errors?.name?.[0]}</FieldError>
            </div>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner className="size-4 border-[3px]" />}
              {pending ? "生成中…" : "生成 Token"}
            </Button>
          </form>

          {newToken && (
            <Alert variant="warning" title="明文仅此一次" className="mt-4">
              请立即复制保存，关闭后将无法再次查看：
              <code className="mt-2 block break-all rounded-input border-2 border-ink bg-bg p-3 font-mono text-sm text-ink">
                {newToken}
              </code>
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* 列表 */}
      <Card>
        <CardHeader>
          <h2 className="heading text-xl">现有 Token（{tokens.length}）</h2>
        </CardHeader>
        <CardBody className="p-0">
          {tokens.length === 0 ? (
            <p className="p-5 text-sm text-muted">
              还没有 token，生成一个让 AI 接入。
            </p>
          ) : (
            <div className="divide-y-2 divide-paper">
              {tokens.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{t.name}</p>
                      {t.revokedAt ? (
                        <Badge color="muted">已吊销</Badge>
                      ) : (
                        <Badge color="grass">活跃</Badge>
                      )}
                    </div>
                    <code className="text-xs text-muted">{t.prefix}…</code>
                    <p className="text-xs text-muted">
                      创建 {formatDate(t.createdAt)} · 最后使用{" "}
                      {t.lastUsedAt ? formatDate(t.lastUsedAt) : "—"}
                    </p>
                  </div>
                  {!t.revokedAt && (
                    <DestructiveAction
                      label="吊销"
                      title="吊销此 token？"
                      description="使用它的 AI 将立即失效，不可恢复。"
                      confirmLabel="确认吊销"
                      buttonVariant="danger"
                      action={revokeTokenAction.bind(null, projectId, t.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* 接入说明 */}
      <Card>
        <CardHeader className="bg-sky text-white">
          <h2 className="heading text-xl">如何接入 AI</h2>
        </CardHeader>
        <CardBody>
          <p className="mb-3 text-sm font-medium">
            所有 AI 操作走{" "}
            <code className="rounded border-2 border-ink bg-paper px-1">
              /api/agent/**
            </code>
            ，请求头需带 token 与角色名（把{" "}
            <code className="rounded border-2 border-ink bg-paper px-1">HOST</code>{" "}
            换成你的域名）：
          </p>
          <CodeBlock code={CURL_SAMPLE} />
          <p className="mt-3 text-xs text-muted">
            角色名自定义，会显示在看板的领取者上。token 失效后需重新生成。
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
