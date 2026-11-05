"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReelStage } from "@/components/reels/reel-stage";
import { ScreenStatus } from "@/components/page-shell";
import { ensureSeenFlush, recentSeenIds } from "@/lib/seen-queue";
import type { Listing } from "@/lib/types";

export function FeedScreen() {
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    ensureSeenFlush();
    let cancelled = false;
    const seen = recentSeenIds();
    const query = seen.length ? `?seen=${encodeURIComponent(seen.join(","))}` : "";
    fetch(`/api/feed${query}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("load failed");
        return (await response.json()) as { listings: Listing[] };
      })
      .then((data) => {
        if (!cancelled) setListings(data.listings);
      })
      .catch(() => {
        if (!cancelled) setError("Не удалось загрузить объявления");
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (error) {
    return (
      <ScreenStatus title={error}>
        <button
          type="button"
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
          onClick={() => {
            setError(null);
            setListings(null);
            setAttempt((value) => value + 1);
          }}
        >
          Повторить
        </button>
      </ScreenStatus>
    );
  }

  if (!listings) {
    return <ScreenStatus title="cartok" />;
  }

  if (listings.length === 0) {
    return (
      <ScreenStatus title="Пока нет объявлений">
        <Link href="/sell" className="text-sm text-amber-300">
          Создать первое
        </Link>
      </ScreenStatus>
    );
  }

  return <ReelStage listings={listings} returnTo="/" />;
}
