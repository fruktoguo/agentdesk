import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 天

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);

export type SessionPayload = {
  userId: string;
  expiresAt: number; // epoch 毫秒
};

/** 加密 session payload 为 JWT */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/** 解密 session JWT（失败返回 null，不抛错） */
export async function decrypt(session?: string): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** 创建并写入 session cookie */
export async function createSession(userId: string): Promise<void> {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const session = await encrypt({ userId, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

/** 删除 session cookie */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const SESSION_COOKIE = COOKIE_NAME;
