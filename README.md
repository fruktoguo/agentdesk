# AgentDesk

## AI Skill 安装

本仓库内置了一个可给 Codex、Claude Code 或其他支持 `SKILL.md` 目录结构的 AI Agent 使用的 AgentDesk API skill：

```text
skills/agentdesk-api
```

GitHub 推送后可直接把下面两个链接发给 AI：

```text
Skill 目录：
https://github.com/fruktoguo/agentdesk/tree/main/skills/agentdesk-api

Raw SKILL.md：
https://raw.githubusercontent.com/fruktoguo/agentdesk/main/skills/agentdesk-api/SKILL.md
```

Codex 本地安装：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/agentdesk-api "${CODEX_HOME:-$HOME/.codex}/skills/"
cp "${CODEX_HOME:-$HOME/.codex}/skills/agentdesk-api/.env.example" \
  "${CODEX_HOME:-$HOME/.codex}/skills/agentdesk-api/.env"
chmod +x "${CODEX_HOME:-$HOME/.codex}/skills/agentdesk-api/scripts/agentdesk_api.py"
```

Claude Code 或其他 Agent 可把整个 `skills/agentdesk-api` 目录复制到自身的 skills 目录。关键是保留 `SKILL.md`、`scripts/agentdesk_api.py` 和 `.env.example` 的相对位置。

安装后编辑本地 `.env`：

```env
AGENTDESK_HOST=https://taskhub.yuohira.com/
AGENTDESK_TOKEN=项目 Token
```

不要提交 `.env`，仓库版已通过 `skills/agentdesk-api/.gitignore` 忽略它。`AGENTDESK_ROLE` 不写入 `.env`；AI 应根据自身模型和任务传 `--role`，不确定时询问开发者。

快速测试：

```bash
python3 ~/.codex/skills/agentdesk-api/scripts/agentdesk_api.py --role codex planning
```

### 建议加入项目规则

为了让 AI 更好地影响项目、减少遗漏，建议把下面这段加入项目规则文件，例如 `AGENTS.md`、`CLAUDE.md`、Codex custom instructions 或其他 Agent 的 project rules：

```text
当本项目安装了 agentdesk-api skill 时，开始任何非琐碎工作前，先使用该 skill 读取 AgentDesk 项目状态：

1. 读取项目 planning，理解当前目标、约束和已知决策。
2. 查询 OPEN 与 NEEDS_FIX 任务，确认是否存在更高优先级或已分配的剩余问题/待办。
3. 如果用户没有指定具体任务，优先 claim-next 或询问开发者应处理哪个任务。
4. 在开始实现前领取对应任务；无法判断角色时询问开发者应使用什么 X-Agent-Role。
5. 工作中发现独立缺陷或后续事项时，创建 issue 或 task，不要只留在聊天记录里。
6. 完成后用 complete 回传结果，说明改了什么、验证了什么、仍有哪些风险；如果被阻塞，用 needs-fix 写清原因。
7. 不要输出、提交或记录 AGENTDESK_TOKEN；只从本地 skill .env 或开发者批准的安全来源读取。
```

更完整的安装说明见 [docs/agentdesk-api-skill-install.md](docs/agentdesk-api-skill-install.md)。

AgentDesk 是一个面向 **人类 + AI Agent 协作** 的任务与缺陷管理平台。它借鉴了禅道、Jira、Issue Tracker 这类系统的工作方式，但重点不是“管理人”，而是“管理多个 AI 代理如何接任务、做任务、回传结果、留下审计记录”。

你可以把它理解为一个 **AI-first 的研发协作中枢**：
人类在 Web 端创建项目、规划、任务和问题；AI 通过项目 Token 接入，以角色身份领取任务、创建任务、记录问题、更新规划、完成或打回任务；所有关键动作都会进入统一事件流，并通过 SSE 实时同步到前端看板。

UI 风格采用孟菲斯 / Neo-brutalism 风格：糖果撞色、粗黑描边、强对比、硬阴影。

## 这个平台解决什么问题

传统研发协作工具主要是为“人”设计的，而现在越来越多工作已经由 AI 参与完成，比如代码审查、修 bug、补测试、写文档、整理问题、更新规划。问题在于，AI 的工作经常散落在聊天记录、终端输出、临时脚本、Git diff 和零散的 issue 里，缺少统一的派单、状态追踪和留痕机制。

这个平台解决的核心痛点是：

- 任务如何被 AI 安全领取，避免重复干活。
- 多个 AI 角色如何共享一个任务池，而不是各自为政。
- AI 做了什么、什么时候做的、为什么打回、谁确认过，如何留痕。
- 人类如何在 Web 界面看到 AI 的实时进展。
- AI 发现的问题如何沉淀成结构化 Issue，再转成任务闭环处理。
- 项目规划如何作为长期上下文持续维护，而不是只存在于聊天里。

一句话概括：
**这是一个给 AI Agent 用的研发任务调度与缺陷跟踪平台。**

## 核心能力

- **账号体系**：邮箱注册 / 登录，session 使用 `jose` 加密，密码使用 `bcryptjs` 哈希。
- **项目管理**：创建、编辑、删除项目；项目是协作容器，用来承载任务、问题、规划、Token 和事件。
- **项目 Token**：每个项目可以创建多个 Token，Token 明文只展示一次，数据库只存哈希，并记录最近使用时间，可吊销。
- **任务状态机**：`OPEN → CLAIMED → DONE / NEEDS_FIX / CANCELLED`，支持 `claim`、`release`、`complete`、`needs-fix`、`cancel`。
- **问题管理**：Issue 独立存在，可创建、解决，并可一键转成任务。
- **规划文档**：项目级 Markdown 规划，供人类和 AI 共享。
- **统一事件流**：所有写操作都会记录到 `Event`，用于审计、时间线和 SSE 推送。
- **实时看板**：任务状态变化后，前端通过 SSE 实时刷新。
- **双入口协作**：Web 端给人类使用，HTTP API 给 AI Agent 使用。

## 技术栈

Next.js 16（App Router）· React 19 · TypeScript · Tailwind CSS 4 · Prisma 7（driver adapter）· PostgreSQL · jose · Zod 4 · Docker

## 项目能力边界

当前代码库已经具备一个可运行的 MVP，但它不是完整的企业级 ALM 系统。它更接近：

- 项目管理
- 缺陷跟踪
- 任务看板
- AI Agent 调度
- 事件审计

当前 schema 中没有成员表，也没有复杂的组织 / 部门 / 权限体系。项目页面、任务页面、问题页面、Token 页面、规划页面和设置页面已经形成了完整闭环，但如果要演进成更完整的禅道式系统，还可以继续补充：成员管理、角色权限、测试用例、迭代、发布、燃尽图等能力。

## 权限模型

当前平台的权限边界比较简洁，可以概括为三条：

- **登录用户**：可以查看所有项目的概览、任务、问题、规划，可以在任务详情页添加评论。
- **项目拥有者（owner）**：可以在 Web 端进行所有写操作，包括创建任务、取消任务、创建问题、解决问题、问题转任务、更新规划、生成或吊销 Token、编辑或删除项目。非拥有者访问 Token 与设置页时会自动重定向回项目主页，对应标签也会被隐藏。
- **AI Agent**：通过项目 Token（`Authorization: Bearer <token>` + `X-Agent-Role`）访问 `/api/agent/**`，只能操作该 Token 所属项目的任务、问题与规划。

所有 Web 端写操作和资源归属校验都在 server action 或 DAL 层完成，不依赖客户端控制；任务或问题一旦不属于该项目，对应操作会直接被拒绝。问题转任务使用事务，避免并发情况下重复生成任务。

## 快速开始

### 方式一：使用 Docker（推荐）

```bash
# 1. 准备环境变量
cp .env.example .env
# 至少设置一个强随机的 SESSION_SECRET

# 2. 启动数据库和应用
docker compose up -d --build
```

启动后访问：`http://localhost:3000`

如果需要导入示例数据，推荐使用“本地开发”方式安装依赖后执行 `pnpm db:seed`。示例数据会创建演示账号：`demo@agentdesk.dev` / `password123`。

### 方式二：本地开发

```bash
# 1. 启动 PostgreSQL
docker compose up -d db

# 2. 安装依赖
pnpm install

# 3. 初始化数据库
pnpm db:migrate
pnpm db:seed

# 4. 启动开发服务器
pnpm dev
```

默认本地地址：`http://localhost:3000`

如果你在 WSL2 或多项目开发环境中遇到 `ENOSPC: file watchers reached`，项目已在 `next.config.ts` 启用轮询监听。若仍不足，可以提升系统 watcher 上限。

## 环境变量

项目运行至少需要以下环境变量：

```env
DATABASE_URL=postgresql://agentdesk:agentdesk@localhost:5434/agentdesk?schema=public
SESSION_SECRET=your-strong-random-secret
APP_URL=http://localhost:3000
POSTGRES_USER=agentdesk
POSTGRES_PASSWORD=agentdesk
POSTGRES_DB=agentdesk
POSTGRES_PORT=5434
APP_PORT=3000
```

说明：

- `DATABASE_URL` 用于 Prisma 连接数据库。
- `SESSION_SECRET` 用于 session JWT 签名，生产环境务必使用高强度随机字符串。
- `APP_URL` 用于应用运行时生成绝对地址时使用。
- `POSTGRES_*` 和 `APP_PORT` 主要给 `docker compose` 使用。

## 常用脚本

```bash
pnpm dev         # 开发模式
pnpm build       # 生产构建
pnpm start       # 启动生产服务
pnpm lint        # ESLint 检查
pnpm typecheck   # TypeScript 类型检查
pnpm db:migrate  # 执行 Prisma migration
pnpm db:seed     # 导入示例数据
pnpm db:studio   # 打开 Prisma Studio
```

## 人类端功能

### 1. 项目

人类用户登录后可以看到项目列表，并进入某个项目查看完整工作区。项目页包含概览、任务、问题、规划、Token 和设置。

### 2. 任务

任务是平台最核心的工作单元。你可以创建任务、查看任务看板、进入任务详情页、添加评论、取消未完成任务。

任务详情页会展示：状态、优先级、类型、领取者、来源、创建者、时间、结果、事件时间线和评论区。

### 3. 问题

问题（Issue）用于记录缺陷、审查发现、待处理事项等。问题可以被标记为已解决，也可以一键转成任务，进入可领取的任务流。

### 4. 规划

规划页用于维护项目级 Markdown 规划文档。它既可以是人类的长期说明，也可以作为 AI 的上下文来源。

### 5. Token

Token 页用于创建和管理项目级 AI 凭证。创建后只会展示一次明文，请妥善保存。后续如果要让 AI 接入项目，就需要把这个 Token 提供给对应 Agent。

### 6. 设置

设置页支持修改项目信息和删除项目。删除是不可恢复操作，会清理该项目下的任务、问题、事件和 Token。

## AI 接入方式

AI Agent 通过 HTTP API 接入，不需要登录 Web 会话。

### 鉴权方式

请求头必须同时包含：

```http
Authorization: Bearer <token>
X-Agent-Role: <角色名>
```

其中：

- `Authorization` 使用项目 Token。
- `X-Agent-Role` 用来标识当前 Agent 的角色名，例如 `code-reviewer`、`fix-bot`、`docs-bot`。

### 常用 API

#### 任务

```bash
# 列出任务
curl -X GET "HOST/api/agent/tasks?status=OPEN" \
  -H "Authorization: Bearer <token>" \
  -H "X-Agent-Role: code-reviewer"

# 创建任务
curl -X POST "HOST/api/agent/tasks" \
  -H "Authorization: Bearer <token>" \
  -H "X-Agent-Role: code-reviewer" \
  -H "Content-Type: application/json" \
  -d '{"title":"审查登录流程","priority":"HIGH","description":"检查 session 与权限边界"}'

# 智能领取下一个任务
curl -X POST "HOST/api/agent/tasks/claim-next" \
  -H "Authorization: Bearer <token>" \
  -H "X-Agent-Role: code-reviewer"

# 领取指定任务
curl -X POST "HOST/api/agent/tasks/<taskId>/claim" \
  -H "Authorization: Bearer <token>" \
  -H "X-Agent-Role: code-reviewer"

# 释放任务
curl -X POST "HOST/api/agent/tasks/<taskId>/release" \
  -H "Authorization: Bearer <token>" \
  -H "X-Agent-Role: code-reviewer"

# 完成任务
curl -X POST "HOST/api/agent/tasks/<taskId>/complete" \
  -H "Authorization: Bearer <token>" \
  -H "X-Agent-Role: code-reviewer" \
  -H "Content-Type: application/json" \
  -d '{"result":"已完成修复并通过自检"}'

# 打回待修复
curl -X POST "HOST/api/agent/tasks/<taskId>/needs-fix" \
  -H "Authorization: Bearer <token>" \
  -H "X-Agent-Role: code-reviewer" \
  -H "Content-Type: application/json" \
  -d '{"reason":"需要补充边界条件测试"}'
```

#### 问题

```bash
# 列出问题
curl -X GET "HOST/api/agent/issues?status=OPEN" \
  -H "Authorization: Bearer <token>" \
  -H "X-Agent-Role: code-reviewer"

# 创建问题
curl -X POST "HOST/api/agent/issues" \
  -H "Authorization: Bearer <token>" \
  -H "X-Agent-Role: code-reviewer" \
  -H "Content-Type: application/json" \
  -d '{"title":"发现登录页边界错误","severity":"HIGH"}'

# 将问题转成任务
curl -X POST "HOST/api/agent/issues/<issueId>/to-task" \
  -H "Authorization: Bearer <token>" \
  -H "X-Agent-Role: code-reviewer"

# 标记问题已解决
curl -X POST "HOST/api/agent/issues/<issueId>/resolve" \
  -H "Authorization: Bearer <token>" \
  -H "X-Agent-Role: code-reviewer"
```

#### 规划

```bash
# 读取项目规划
curl -X GET "HOST/api/agent/planning" \
  -H "Authorization: Bearer <token>" \
  -H "X-Agent-Role: code-reviewer"

# 更新项目规划
curl -X PUT "HOST/api/agent/planning" \
  -H "Authorization: Bearer <token>" \
  -H "X-Agent-Role: code-reviewer" \
  -H "Content-Type: application/json" \
  -d '{"planning":"## 项目目标\n..."}'
```

### API 概览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/agent/tasks` | 列出项目任务，可用 `status` 过滤 |
| POST | `/api/agent/tasks` | 创建任务 |
| POST | `/api/agent/tasks/claim-next` | 原子领取下一个可处理任务 |
| POST | `/api/agent/tasks/:taskId/claim` | 领取指定任务 |
| POST | `/api/agent/tasks/:taskId/release` | 释放当前任务 |
| POST | `/api/agent/tasks/:taskId/complete` | 完成任务 |
| POST | `/api/agent/tasks/:taskId/needs-fix` | 打回待修复 |
| GET | `/api/agent/issues` | 列出项目问题，可用 `status` 过滤 |
| POST | `/api/agent/issues` | 创建问题 |
| POST | `/api/agent/issues/:issueId/to-task` | 将问题转成任务 |
| POST | `/api/agent/issues/:issueId/resolve` | 标记问题已解决 |
| GET | `/api/agent/planning` | 读取项目规划 |
| PUT | `/api/agent/planning` | 更新项目规划 |
| GET | `/api/projects/:id/events` | 订阅项目 SSE 事件流 |

### 返回约定

- 认证失败通常返回 `401`。
- 请求无权限时返回 `403`。
- 参数校验失败返回 `422`。
- 资源不存在返回 `404`。
- 指定任务已被抢占时，`claim` 会返回 `409`，并附带当前领取者信息。

## 任务状态机

```text
        ┌──────────── claim ────────────┐
        ▼                               │
 OPEN 待领取 ──▶ CLAIMED 进行中 ──▶ DONE 已完成
        ▲               │
        │               ├── release ──▶ OPEN
        │               ├── needs-fix ─▶ NEEDS_FIX 待修复 ──claim──▶ CLAIMED
        │               └── cancel ────▶ CANCELLED 已取消
```

说明：

- `claim-next` 和 `claim` 都会把 `OPEN` / `NEEDS_FIX` 的任务置为 `CLAIMED`。
- 所有状态变更都会写入统一 `Event` 表。
- 前端任务看板通过 SSE 监听事件，自动刷新页面数据。

## 事件与审计

系统中的关键写操作都会进入统一事件流，包括：

- 任务创建、领取、释放、完成、打回、取消
- 问题创建、解决、转任务
- 规划更新
- Token 创建、吊销
- 任务评论

事件表的作用有三层：

1. 作为审计日志保留历史。
2. 作为任务详情页时间线数据源。
3. 作为 SSE 推送的数据来源。

## 数据模型概览

主要实体包括：

- `User`：登录用户
- `Project`：项目容器
- `ProjectToken`：项目级 AI 凭证
- `Task`：任务
- `Issue`：问题
- `Event`：统一事件流
- `Comment`：任务评论

当前模型强调的是“项目级协作”，而不是复杂组织结构。也就是说，项目是核心边界，任务、问题、规划、Token 和事件都围绕项目展开。

## 项目结构

```text
prisma/            schema、迁移、seed
src/app/           App Router 页面与 API
  (auth)/          登录 / 注册
  (dashboard)/     项目列表、项目详情、任务、问题、规划、Token、设置
  api/agent/       AI Agent API
  api/projects/    SSE 事件流
src/components/    页面组件与 UI 组件
src/lib/           prisma、session、事件流、任务服务、问题服务、校验
src/generated/     Prisma Client 生成结果
public/            静态资源
```

## 开发说明

- `src/proxy.ts` 负责基础路由守卫：未登录用户会被重定向到登录页。
- 真正的权限判断应在 server action、DAL 或 route handler 内完成，而不是只依赖 proxy。
- 当前 SSE 事件总线使用本进程 `EventEmitter` 做即时广播，并通过 PostgreSQL `LISTEN/NOTIFY` 桥接跨进程事件。
- Prisma 使用 driver adapter 模式，通过 `prisma.config.ts` 配置 migration / seed，运行时则由 `@prisma/adapter-pg` 连接数据库。

## Docker 部署

`docker-compose.yml` 默认启动 PostgreSQL、一次性迁移任务和应用服务。迁移任务复用同一个已构建应用镜像中的轻量 SQL runner，应用容器本身只启动 Next.js 服务器。

GitHub Actions 部署到 `apiserver` 时由 GitHub runner 构建并推送镜像，服务器只拉取镜像、运行迁移和重启容器，不在服务器上构建或编译。

常用命令：

```bash
docker compose up -d --build
docker compose logs -f app
docker compose down
```

## 许可证

MIT
