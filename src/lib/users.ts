import "server-only";

import { backendFetch } from "@/lib/backend";
import type { PublicUser } from "@/lib/types";

/** Пользователи живут в Spring-бекенде (pl.cartok.user), сессию по-прежнему подписывает Next. */

type UserResponse = { user?: PublicUser; error?: string };

async function readUser(response: Response): Promise<UserResponse> {
  try {
    return (await response.json()) as UserResponse;
  } catch {
    return {};
  }
}

function unexpected(path: string, response: Response): Error {
  return new Error(`backend ${path}: ${response.status}`);
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  const path = `/api/users/${encodeURIComponent(id)}`;
  const response = await backendFetch(path);
  if (response.status === 404) return null;
  if (!response.ok) throw unexpected(path, response);
  return (await readUser(response)).user ?? null;
}

export async function loginUser(input: { email: string; password: string }): Promise<PublicUser | null> {
  const path = "/api/users/login";
  const response = await backendFetch(path, { method: "POST", body: input });
  if (response.status === 401) return null;
  if (!response.ok) throw unexpected(path, response);
  return (await readUser(response)).user ?? null;
}

/** Next уже проверил id_token Google. Бекенд только находит или создаёт пользователя. */
export async function loginWithGoogle(input: { sub: string; email: string; name: string }) {
  const path = "/api/users/google";
  const response = await backendFetch(path, { method: "POST", body: { ...input, emailVerified: true } });
  const data = await readUser(response);
  if (response.status === 409 || response.status === 400 || response.status === 401) {
    return { ok: false as const, error: data.error ?? "Не удалось войти через Google" };
  }
  if (!response.ok || !data.user) throw unexpected(path, response);
  return { ok: true as const, user: data.user };
}

export async function registerUser(input: { email: string; password: string; name: string }) {
  const path = "/api/users";
  const response = await backendFetch(path, { method: "POST", body: input });
  const data = await readUser(response);
  if (response.status === 409 || response.status === 400) {
    return { ok: false as const, status: response.status, error: data.error ?? "Не удалось зарегистрироваться" };
  }
  if (!response.ok || !data.user) throw unexpected(path, response);
  return { ok: true as const, user: data.user };
}
