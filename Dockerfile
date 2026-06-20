# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm config set dangerouslyAllowAllBuilds true \
  && pnpm install --frozen-lockfile

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL=postgresql://placeholder@localhost:5432/placeholder
RUN pnpm exec prisma generate
RUN pnpm run build

FROM node:${NODE_VERSION} AS app
WORKDIR /app
ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  HOSTNAME=0.0.0.0 \
  PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY prisma/migrations ./prisma/migrations
COPY scripts/run-migrations.mjs ./scripts/run-migrations.mjs

EXPOSE 3000
CMD ["node", "server.js"]
