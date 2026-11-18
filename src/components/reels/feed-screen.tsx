"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useBackendReady } from "@/components/backend-gate";
import { AppHeader } from "@/components/app-header";
import { ReelStage } from "@/components/reels/reel-stage";
import { ScreenStatus } from "@/components/page-shell";
import { SEEN_PARAM_LIMIT } from "@/lib/feed-rank";
import { ensureSeenFlush, recentSeenIds } from "@/lib/seen-queue";
import { EMPTY_SEARCH, isSearchActive, matchesSearch, type SearchQuery } from "@/lib/search";
import type { Listing } from "@/lib/types";

export function FeedScreen({
  suspended = false,
  search = EMPTY_SEARCH,
  reloadToken = 0,
  onOpenSettings,
  onClearSearch,
}: {
  suspended?: boolean;
  search?: SearchQuery;
  reloadToken?: number;
  onOpenSettings?: () => void;
  onClearSearch?: () => void;
}) {
  const backendReady = useBackendReady();
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const listingsRef = useRef<Listing[] | null>(null);
  const generation = useRef(0);
  const loadingMore = useRef(false);
  const reloading = useRef(false);
  const exhausted = useRef(false);

  useEffect(() => {
    listingsRef.current = listings;
  }, [listings]);

  useEffect(() => {
    if (!backendReady) return;
    ensureSeenFlush();
    const gen = ++generation.current;
    exhausted.current = false;
    reloading.current = true;
    let cancelled = false;
    const seen = recentSeenIds();
    const query = seen.length ? `?seen=${encodeURIComponent(seen.join(","))}` : "";
    fetch(`/api/feed${query}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("load failed");
        return (await response.json()) as { listings: Listing[] };
      })
      .then((data) => {
        if (cancelled || gen !== generation.current) return;
        setListings(data.listings);
        setError(null);
        setEpoch((value) => value + 1);
      })
      .catch(() => {
        if (cancelled || gen !== generation.current) return;
        if (listingsRef.current == null) setError("Не удалось загрузить объявления");
      })
      .finally(() => {
        if (gen === generation.current) reloading.current = false;
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, backendReady, reloadToken]);

  const loadMore = useCallback(() => {
    if (!backendReady || reloading.current || loadingMore.current || exhausted.current) return;
    const current = listingsRef.current;
    if (!current?.length) return;
    const gen = generation.current;
    loadingMore.current = true;
    const seen = current.map((item) => item.id).slice(-SEEN_PARAM_LIMIT);
    fetch(`/api/feed?seen=${encodeURIComponent(seen.join(","))}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("load failed");
        return (await response.json()) as { listings: Listing[] };
      })
      .then((data) => {
        if (gen !== generation.current) return;
        const known = new Set((listingsRef.current ?? []).map((item) => item.id));
        const fresh = data.listings.filter((item) => !known.has(item.id));
        if (fresh.length === 0) {
          exhausted.current = true;
          return;
        }
        setListings((prev) => {
          if (!prev) return fresh;
          const ids = new Set(prev.map((item) => item.id));
          return prev.concat(fresh.filter((item) => !ids.has(item.id)));
        });
      })
      .catch(() => {
        // Сеть оборвалась: следующий подход к концу ленты попробует ещё раз.
      })
      .finally(() => {
        loadingMore.current = false;
      });
  }, [backendReady]);

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
      <div className="relative h-full">
        <AppHeader overlay onSettings={onOpenSettings} />
        <ScreenStatus title="Пока нет объявлений">
          <Link href="/sell" className="text-sm text-amber-300">
            Создать первое
          </Link>
        </ScreenStatus>
      </div>
    );
  }

  const visible = listings.filter((listing) => matchesSearch(listing, search));
  if (visible.length === 0 && isSearchActive(search)) {
    return (
      <div className="relative h-full">
        <AppHeader overlay onSettings={onOpenSettings} />
        <ScreenStatus title="Ничего не подошло">
          <button type="button" onClick={onClearSearch} className="text-sm text-amber-300">
            Сбросить поиск
          </button>
        </ScreenStatus>
      </div>
    );
  }

  return (
    <ReelStage
      key={epoch}
      listings={visible}
      returnTo="/"
      suspended={suspended}
      reserveNav
      onNearEnd={isSearchActive(search) ? undefined : loadMore}
      onSettings={onOpenSettings}
    />
  );
}
