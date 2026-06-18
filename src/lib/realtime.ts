import { EventEmitter } from "node:events";

/**
 * 单实例内存事件总线（dev 与单容器部署足够）。
 * 多实例横向扩展时，叠加 Postgres LISTEN/NOTIFY 桥接跨进程广播。
 */
const bus = new EventEmitter();
bus.setMaxListeners(0);

export type ProjectEvent = {
  type: string;
  taskId?: string;
  issueId?: string;
  actorRole?: string | null;
  actorType?: string;
  summary?: string;
  createdAt: string;
};

export function publishProjectEvent(projectId: string, event: ProjectEvent) {
  bus.emit(`project:${projectId}`, event);
}

/** 订阅某项目事件流，返回取消订阅函数 */
export function subscribeProject(
  projectId: string,
  cb: (e: ProjectEvent) => void,
): () => void {
  const channel = `project:${projectId}`;
  bus.on(channel, cb);
  return () => {
    bus.off(channel, cb);
  };
}
