import "server-only";

import { FUELS, TRANSMISSIONS } from "@/lib/types";
import type { ActivityEvent, Fuel, Listing, Transmission } from "@/lib/types";

/** Ответ Spring-бекенда (pl.cartok.feed.ListingView): неизвестное приходит как 0, "" или null. */
type BackendListing = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileageKm: number;
  fuel: string;
  transmission: string;
  location: string;
  description: string;
  images: string[] | null;
  seller: { id: string; name: string; kind: string } | null;
  createdAt: string | null;
  liked?: boolean;
  sourceUrl?: string | null;
};

export function backendConfigured(): boolean {
  return Boolean(process.env.CARTOK_API_URL);
}

const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Потолок одного пробуждения. Cloud Run держит запрос и передаёт его приложению,
 * как только контейнер поднялся, поэтому ответ приходит раньше этого потолка.
 */
export const WAKE_TIMEOUT_MS = 60_000;

/** Ответ отдаётся как есть: статусы вроде 401 и 409 разбирает вызывающий. */
export async function backendFetch(
  path: string,
  init: { method?: string; body?: unknown; timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<Response> {
  const base = process.env.CARTOK_API_URL;
  if (!base) throw new Error("CARTOK_API_URL не задан");
  const headers: Record<string, string> = {};
  const token = process.env.CARTOK_SERVICE_TOKEN;
  if (token) headers["X-Service-Token"] = token;
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  const timeout = AbortSignal.timeout(init.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  return fetch(new URL(path, base), {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
    signal: init.signal ? AbortSignal.any([timeout, init.signal]) : timeout,
  });
}

/**
 * Инстанс готов, если приложение ответило. 404 тоже считается: процесс уже слушает,
 * даже если ручка /api/health ещё не задеплоена. 5xx и обрыв соединения — ещё нет.
 */
export async function pingBackend(timeoutMs: number, signal?: AbortSignal): Promise<boolean> {
  if (!backendConfigured()) return true;
  try {
    const response = await backendFetch("/api/health", { timeoutMs, signal });
    return response.status < 500;
  } catch (error) {
    if (!isAbort(error)) console.error("health", error);
    return false;
  }
}

function isAbort(error: unknown): boolean {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
}

async function request<T>(path: string): Promise<T | null> {
  const response = await backendFetch(path);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`backend ${path}: ${response.status}`);
  return (await response.json()) as T;
}

function known(value: number): number | null {
  return value > 0 ? value : null;
}

function toListing(raw: BackendListing): Listing {
  return {
    id: raw.id,
    title: raw.title,
    make: raw.make,
    model: raw.model,
    year: known(raw.year),
    price: known(raw.price),
    currency: raw.currency || "PLN",
    mileageKm: known(raw.mileageKm),
    fuel: FUELS.includes(raw.fuel as Fuel) ? (raw.fuel as Fuel) : null,
    transmission: TRANSMISSIONS.includes(raw.transmission as Transmission)
      ? (raw.transmission as Transmission)
      : null,
    location: raw.location,
    description: raw.description,
    images: raw.images ?? [],
    seller: {
      id: raw.seller?.id ?? "",
      name: raw.seller?.name ?? "",
      kind: raw.seller?.kind === "dealer" ? "dealer" : "private",
    },
    createdAt: raw.createdAt,
    liked: raw.liked ?? false,
    sourceUrl: externalUrl(raw.sourceUrl),
  };
}

function externalUrl(value: string | null | undefined) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

/** Объявления, которых бекенд не знает (созданные во фронтенде), он молча пропускает. */
export async function recordActivity(userId: string, events: ActivityEvent[]): Promise<number> {
  if (!backendConfigured() || events.length === 0) return 0;
  const path = `/api/users/${encodeURIComponent(userId)}/activity`;
  const response = await backendFetch(path, { method: "POST", body: { events } });
  if (response.status === 404) return 0;
  if (!response.ok) throw new Error(`backend ${path}: ${response.status}`);
  return ((await response.json()) as { recorded: number }).recorded;
}

/** С userId — лента по его предпочтениям, без — общая. */
export async function fetchFeed(seenIds: string[], userId: string | null): Promise<Listing[]> {
  const query = new URLSearchParams({ limit: "30" });
  if (seenIds.length) query.set("seen", seenIds.join(","));
  const path = userId ? `/api/users/${encodeURIComponent(userId)}/feed` : "/api/feed";
  const data = await request<{ listings: BackendListing[] }>(`${path}?${query}`);
  return (data?.listings ?? []).map(toListing);
}

export async function fetchListings(): Promise<Listing[]> {
  const data = await request<{ listings: BackendListing[] }>("/api/listings?limit=50");
  return (data?.listings ?? []).map(toListing);
}

export async function fetchListing(id: string): Promise<Listing | null> {
  const data = await request<{ listing: BackendListing }>(`/api/listings/${encodeURIComponent(id)}`);
  return data ? toListing(data.listing) : null;
}
