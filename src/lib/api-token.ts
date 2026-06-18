import "server-only";
import { createHash } from "node:crypto";
import { customAlphabet } from "nanoid";

const TOKEN_PREFIX = "agd_"; // AgentDesk token 前缀

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

const generateRaw = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  40,
);

export interface GeneratedToken {
  /** 明文 token，仅创建时返回一次 */
  token: string;
  /** 存入数据库的哈希 */
  tokenHash: string;
  /** 明文前 12 位，用于界面识别（如 agd_aB3xK9q2） */
  prefix: string;
}

/** 生成新的项目 API token（明文 + 哈希 + 前缀） */
export function generateToken(): GeneratedToken {
  const token = TOKEN_PREFIX + generateRaw();
  return {
    token,
    tokenHash: sha256(token),
    prefix: token.slice(0, 12),
  };
}

/** 对传入的明文 token 计算哈希，用于与数据库比对 */
export function hashToken(token: string): string {
  return sha256(token);
}
