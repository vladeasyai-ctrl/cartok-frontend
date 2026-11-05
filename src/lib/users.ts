import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { createLock } from "@/lib/lock";
import type { PublicUser } from "@/lib/types";

/**
 * Временное хранилище пользователей в data/users.json.
 * На Vercel файлы между вызовами не сохраняются — этот модуль заменится клиентом бекенда.
 */

const scryptAsync = promisify(scrypt);
const locked = createLock();
const filePath = path.join(process.cwd(), "data", "users.json");

type StoredUser = PublicUser & { passwordHash: string };

export function toPublic(user: StoredUser): PublicUser {
  return { id: user.id, email: user.email, name: user.name };
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  const keyBuffer = Buffer.from(key, "hex");
  if (hash.length !== keyBuffer.length) return false;
  return timingSafeEqual(hash, keyBuffer);
}

async function persist(users: StoredUser[]) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(users, null, 2), "utf8");
}

async function load(): Promise<StoredUser[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as StoredUser[];
    if (!Array.isArray(parsed)) throw new Error("users store is not an array");
    return parsed;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
    const demo = await buildUser({
      id: "user_demo",
      email: "demo@cartok.dev",
      name: "Демо",
      password: "demo1234",
    });
    await persist([demo]);
    return [demo];
  }
}

async function buildUser(input: {
  id: string;
  email: string;
  name: string;
  password: string;
}): Promise<StoredUser> {
  return {
    id: input.id,
    email: input.email,
    name: input.name,
    passwordHash: await hashPassword(input.password),
  };
}

export function findUserByEmail(email: string) {
  return locked(async () => {
    const users = await load();
    return users.find((user) => user.email === email) ?? null;
  });
}

export function findUserById(id: string) {
  return locked(async () => {
    const users = await load();
    return users.find((user) => user.id === id) ?? null;
  });
}

export function registerUser(input: { email: string; password: string; name: string }) {
  return locked(async () => {
    const users = await load();
    if (users.some((user) => user.email === input.email)) {
      return { ok: false as const, error: "Такой email уже зарегистрирован" };
    }
    const user = await buildUser({
      id: `user_${crypto.randomUUID()}`,
      email: input.email,
      name: input.name,
      password: input.password,
    });
    users.push(user);
    await persist(users);
    return { ok: true as const, user: toPublic(user) };
  });
}
