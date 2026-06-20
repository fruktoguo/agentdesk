# TaskHub GitHub 自动部署

推送到 `main` 后，GitHub Actions 在 runner 上构建镜像并推送到 GHCR，然后通过 SSH 到 `apiserver` 只执行部署动作：

- `docker pull` 拉取已构建镜像
- `docker compose up -d --no-build --wait db` 启动/确认数据库
- 用同一个 app 镜像执行 `node scripts/run-migrations.mjs`
- `docker compose up -d --no-build --remove-orphans app` 重启应用

服务器不会执行 `docker build`、`pnpm install`、`next build` 或任何编译步骤。

## 必需 Secrets

仓库 Settings -> Secrets and variables -> Actions 中配置：

```text
APISERVER_HOST=152.32.204.217
APISERVER_USER=ubuntu
APISERVER_PORT=22
APISERVER_SSH_KEY=<可登录 apiserver 的私钥>

TASKHUB_POSTGRES_PASSWORD=<现有 taskhub 数据库密码>
TASKHUB_SESSION_SECRET=<生产 session secret>

GHCR_DEPLOY_USER=<可拉取 GHCR package 的 GitHub 用户名>
GHCR_DEPLOY_TOKEN=<有 read:packages 权限的 token>
```

可选：

```text
TASKHUB_POSTGRES_USER=taskhub
TASKHUB_POSTGRES_DB=taskhub
TASKHUB_APP_URL=https://taskhub.yuohira.com
TASKHUB_APP_BIND=127.0.0.1
TASKHUB_APP_PORT=3009
```

`TASKHUB_POSTGRES_PASSWORD` 必须与服务器现有 `taskhub-db` 初始化密码一致，否则会连不上旧数据库卷。

## 镜像体积

工作流只推送一个运行镜像。迁移脚本和 SQL 文件包含在同一个 app 镜像内，不再额外推送 Prisma CLI/engine 迁移镜像。

本地验证时 app 镜像约 `217MB`。服务器拉取的只有这个已构建镜像。
