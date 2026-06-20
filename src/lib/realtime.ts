import "server-only";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { Client, Pool } from "pg";

/**
 * 本实例内存事件总线 + Postgres LISTEN/NOTIFY 跨进程桥接。
 * 本地 emit 保证当前请求内实时刷新；NOTIFY 让多容器/多进程订阅者也能收到。
 */
const bus = new EventEmitter();
bus.setMaxListeners(0);
const CHANNEL = "agentdesk_project_events";
const INSTANCE_ID = randomUUID();

export type ProjectEvent = {
  eventId?: string;
  type: string;
  taskId?: string;
  issueId?: string;
  actorRole?: string | null;
  actorType?: string;
  summary?: string;
  createdAt: string;
};

type NotifyPayload = {
  instanceId: string;
  projectId: string;
  event: ProjectEvent;
};

const globalForRealtime = globalThis as unknown as {
  agentdeskRealtime?:
    | {
        listenClient?: Client;
        listenPromise?: Promise<void>;
        notifyPool?: Pool;
      }
    | undefined;
};

const state = (globalForRealtime.agentdeskRealtime ??= {});

function connectionString() {
  return process.env.DATABASE_URL;
}

function emitLocal(projectId: string, event: ProjectEvent) {
  bus.emit(`project:${projectId}`, event);
}

function notifyPool() {
  const url = connectionString();
  if (!url) return null;
  state.notifyPool ??= new Pool({ connectionString: url, max: 1 });
  return state.notifyPool;
}

async function startPgListener() {
  const url = connectionString();
  if (!url || state.listenPromise) return state.listenPromise;

  state.listenPromise = (async () => {
    const client = new Client({ connectionString: url });
    client.on("notification", (msg) => {
      if (msg.channel !== CHANNEL || !msg.payload) return;
      try {
        const payload = JSON.parse(msg.payload) as NotifyPayload;
        if (payload.instanceId === INSTANCE_ID) return;
        emitLocal(payload.projectId, payload.event);
      } catch {
        // Ignore malformed notifications from manual database usage.
      }
    });

    client.on("error", () => {
      state.listenClient = undefined;
      state.listenPromise = undefined;
    });

    await client.connect();
    await client.query(`LISTEN ${CHANNEL}`);
    state.listenClient = client;
  })().catch(() => {
    state.listenClient = undefined;
    state.listenPromise = undefined;
  });

  return state.listenPromise;
}

export async function publishProjectEvent(projectId: string, event: ProjectEvent) {
  emitLocal(projectId, event);

  const pool = notifyPool();
  if (!pool) return;
  const payload: NotifyPayload = { instanceId: INSTANCE_ID, projectId, event };
  try {
    await pool.query("SELECT pg_notify($1, $2)", [
      CHANNEL,
      JSON.stringify(payload),
    ]);
  } catch {
    // Event persistence already succeeded; realtime fanout is best-effort.
  }
}

/** 订阅某项目事件流，返回取消订阅函数 */
export function subscribeProject(
  projectId: string,
  cb: (e: ProjectEvent) => void,
): () => void {
  void startPgListener();
  const channel = `project:${projectId}`;
  bus.on(channel, cb);
  return () => {
    bus.off(channel, cb);
  };
}
