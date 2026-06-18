# ───────────── deps ─────────────
FROM node:22-alpine AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm config set dangerouslyAllowAllBuilds true && pnpm install --frozen-lockfile

# ───────────── builder ─────────────
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="postgresql://placeholder@localhost:5432/placeholder"
RUN pnpm exec prisma generate
RUN pnpm run build

# ───────────── runner（standalone，精简镜像）─────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

# standalone 产物：server.js + 运行时依赖 + package.json
COPY --from=builder /app/.next/standalone ./
# 静态资源与 public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# prisma 迁移所需：schema/migrations/config/generated/CLI
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node server.js"]
