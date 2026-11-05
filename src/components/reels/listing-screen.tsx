"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReelStage } from "@/components/reels/reel-stage";
import { ScreenStatus } from "@/components/page-shell";
import type { Listing } from "@/lib/types";

export function ListingScreen({ id }: { id: string }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/listings/${id}`, { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 404) {
          if (!cancelled) setMissing(true);
          return null;
        }
        if (!response.ok) throw new Error("load failed");
        return (await response.json()) as { listing: Listing };
      })
      .then((data) => {
        if (data && !cancelled) setListing(data.listing);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (missing) {
    return (
      <ScreenStatus title="Объявление не найдено">
        <Link href="/" className="text-sm text-amber-300">
          К ленте
        </Link>
      </ScreenStatus>
    );
  }

  if (!listing) return <ScreenStatus title="cartok" />;

  return <ReelStage listings={[listing]} returnTo={`/listing/${listing.id}`} backHref="/" />;
}
