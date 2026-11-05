import type { Listing } from "@/lib/types";

/**
 * Временное место, куда потом встанет ранжирование по интересу.
 * Сейчас непросмотренные идут первыми, уже виденные не выкидываются:
 * при коротком каталоге лента иначе опустеет. Порядок внутри групп
 * остаётся тем, который отдал источник объявлений.
 */
export function preferUnseen(listings: Listing[], seenIds: string[]): Listing[] {
  if (seenIds.length === 0) return listings;
  const seenAt = new Map(seenIds.map((id, index) => [id, index]));
  const fresh: Listing[] = [];
  const watched: Listing[] = [];
  for (const listing of listings) {
    if (seenAt.has(listing.id)) watched.push(listing);
    else fresh.push(listing);
  }
  watched.sort((a, b) => (seenAt.get(a.id) ?? 0) - (seenAt.get(b.id) ?? 0));
  return fresh.concat(watched);
}

const seenIdPattern = /^[A-Za-z0-9_-]{1,80}$/;

export function parseSeenParam(value: string | null, limit = 20): string[] {
  if (!value) return [];
  const ids: string[] = [];
  for (const part of value.split(",")) {
    const id = part.trim();
    if (!seenIdPattern.test(id) || ids.includes(id)) continue;
    ids.push(id);
    if (ids.length >= limit) break;
  }
  return ids;
}
