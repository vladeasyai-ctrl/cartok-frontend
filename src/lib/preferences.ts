import "server-only";

import { backendFetch } from "@/lib/backend";
import type { Preferences } from "@/lib/types";

function path(userId: string) {
  return `/api/users/${encodeURIComponent(userId)}/preferences`;
}

export async function loadPreferences(userId: string): Promise<Preferences | null> {
  const response = await backendFetch(path(userId));
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`backend ${path(userId)}: ${response.status}`);
  return ((await response.json()) as { preferences: Preferences }).preferences;
}

export async function savePreferences(userId: string, preferences: Preferences) {
  const response = await backendFetch(path(userId), { method: "PUT", body: preferences });
  const data = (await response.json().catch(() => ({}))) as { preferences?: Preferences; error?: string };
  if (response.status === 400 || response.status === 404) {
    return { ok: false as const, status: response.status, error: data.error ?? "Не удалось сохранить" };
  }
  if (!response.ok || !data.preferences) throw new Error(`backend ${path(userId)}: ${response.status}`);
  return { ok: true as const, preferences: data.preferences };
}
