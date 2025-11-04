import argon2 from "argon2";

export async function hashPassword(password: string) {
  return await argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string) {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
}
