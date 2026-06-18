import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/** 对明文密码做哈希 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** 校验明文密码与哈希是否匹配 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
