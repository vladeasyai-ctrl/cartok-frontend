import { emptyInterestProfile, preferencesFromInterest, sanitizeInterestProfile } from "@/lib/interest-sets";
import type { InterestProfile } from "@/lib/types";

/** Локальная копия опроса. В предпочтения уходит только снимок с марками otomoto. */
const STORAGE_KEY = "cartok.interests";

type StoredInterests = { done: boolean; profile: InterestProfile };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function loadInterestProfile(): StoredInterests | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isRecord(parsed.profile)) return null;
    return {
      done: parsed.done === true,
      profile: sanitizeInterestProfile(parsed.profile as InterestProfile),
    };
  } catch {
    return null;
  }
}

export function saveInterestProfile(profile: InterestProfile, done: boolean) {
  const payload: StoredInterests = { done, profile: sanitizeInterestProfile(profile) };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Приватный режим может запретить запись: экран всё равно закроется.
  }
}

export function hasFinishedInterests() {
  return loadInterestProfile()?.done === true;
}

/** Пишет снимок вошедшему пользователю. 401 и обрыв — false, локальная копия уже сохранена отдельно. */
export async function publishInterestProfile(profile: InterestProfile): Promise<boolean> {
  try {
    const response = await fetch("/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferencesFromInterest(profile)),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export { emptyInterestProfile };
