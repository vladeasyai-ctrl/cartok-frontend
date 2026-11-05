/**
 * Локальная очередь просмотренных объявлений.
 * В запросе ленты уходят только последние SEEN_SENT id.
 * Ранжирование по вкусу потом заменит сервер: клиент не задаёт порядок.
 */

const STORAGE_KEY = "cartok_seen";
const QUEUE_LIMIT = 50;
const FLUSH_EVERY = 5;
export const SEEN_SENT = 20;
export const SEEN_AFTER_MS = 800;

type Memory = {
  saved: string[];
  pending: string[];
};

let memory: Memory | null = null;
let listening = false;

function remember(queue: string[], id: string) {
  const existing = queue.indexOf(id);
  if (existing >= 0) queue.splice(existing, 1);
  queue.push(id);
  if (queue.length > QUEUE_LIMIT) queue.splice(0, queue.length - QUEUE_LIMIT);
}

function readSaved(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string").slice(-QUEUE_LIMIT);
  } catch {
    return [];
  }
}

function load(): Memory {
  if (!memory) memory = { saved: readSaved(), pending: [] };
  return memory;
}

function mergedQueue(): string[] {
  const current = load();
  const queue = [...current.saved];
  for (const id of current.pending) remember(queue, id);
  return queue;
}

export function recentSeenIds(limit = SEEN_SENT): string[] {
  return mergedQueue().slice(-limit);
}

export function flushSeen() {
  const current = load();
  if (current.pending.length === 0) return;
  const queue = mergedQueue();
  current.saved = queue;
  current.pending = [];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Приватный режим или переполненная квота: очередь остаётся в памяти вкладки.
  }
}

export function ensureSeenFlush() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("pagehide", flushSeen);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushSeen();
  });
}

export function markSeen(id: string) {
  if (!id) return;
  ensureSeenFlush();
  const current = load();
  const latest = current.pending.at(-1) ?? current.saved.at(-1);
  if (latest === id) return;
  remember(current.pending, id);
  if (current.pending.length >= FLUSH_EVERY) flushSeen();
}
