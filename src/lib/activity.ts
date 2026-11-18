import { ACTIVITY_BATCH_LIMIT } from "@/lib/types";
import type { ActivityEvent } from "@/lib/types";

/**
 * Очередь действий пользователя с объявлениями: показ (сколько мс на экране), открытие, лайк.
 * Уходит пачками в /api/activity, при скрытии страницы — через sendBeacon.
 * Пишется только для вошедших: гостям хватает локальной seen-queue.
 * Не доставленная пачка теряется — это статистика, повторять её незачем.
 */

const FLUSH_EVERY = 5;
const FLUSH_AFTER_MS = 10_000;
/** Короче — просто пролистнул мимо; бекенд такие тоже отбрасывает. */
const MIN_VIEW_MS = 300;

let enabled = false;
let listening = false;
let queue: ActivityEvent[] = [];
let timer: number | null = null;

export function setActivityEnabled(value: boolean) {
  enabled = value;
  if (!value) {
    queue = [];
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  }
}

function listen() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("pagehide", () => flushActivity(true));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushActivity(true);
  });
}

function push(event: ActivityEvent) {
  if (!enabled) return;
  listen();
  queue.push(event);
  if (queue.length >= FLUSH_EVERY) {
    flushActivity();
    return;
  }
  if (timer === null) timer = window.setTimeout(() => flushActivity(), FLUSH_AFTER_MS);
}

export function trackView(listingId: string, dwellMs: number) {
  if (dwellMs < MIN_VIEW_MS) return;
  push({ listingId, kind: "view", dwellMs: Math.round(dwellMs) });
}

export function trackOpen(listingId: string) {
  push({ listingId, kind: "open" });
}

export function trackLike(listingId: string, liked: boolean) {
  push({ listingId, kind: liked ? "like" : "unlike" });
}

export function flushActivity(leaving = false) {
  if (timer !== null) window.clearTimeout(timer);
  timer = null;
  while (queue.length > 0) {
    const body = JSON.stringify({ events: queue.splice(0, ACTIVITY_BATCH_LIMIT) });
    if (leaving && navigator.sendBeacon?.("/api/activity", new Blob([body], { type: "application/json" }))) continue;
    fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}
