import "server-only";

import { FUELS, TRANSMISSIONS } from "@/lib/types";
import type { Fuel, Listing, Transmission } from "@/lib/types";

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
};

export function backendConfigured(): boolean {
  return Boolean(process.env.CARTOK_API_URL);
}

async function request<T>(path: string): Promise<T | null> {
  const base = process.env.CARTOK_API_URL;
  if (!base) throw new Error("CARTOK_API_URL не задан");
  const response = await fetch(new URL(path, base), {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
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
  };
}

export async function fetchFeed(seenIds: string[]): Promise<Listing[]> {
  const query = new URLSearchParams({ limit: "30" });
  if (seenIds.length) query.set("seen", seenIds.join(","));
  const data = await request<{ listings: BackendListing[] }>(`/api/feed?${query}`);
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
