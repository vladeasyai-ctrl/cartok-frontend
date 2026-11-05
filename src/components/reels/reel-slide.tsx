"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { PhotoStack } from "@/components/reels/photo-stack";
import {
  formatMileage,
  formatPrice,
  FUEL_LABEL,
  SELLER_KIND_LABEL,
  TRANSMISSION_LABEL,
} from "@/lib/format";
import type { Listing } from "@/lib/types";

export function ReelSlide({
  listing,
  active,
  returnTo,
  onOpen,
}: {
  listing: Listing;
  active: boolean;
  returnTo: string;
  onOpen: () => void;
}) {
  const { user } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  function onLike() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(returnTo)}`);
      return;
    }
    setLiked((value) => !value);
  }

  return (
    <article
      data-index={listing.id}
      className="relative h-full w-full shrink-0 snap-start snap-always overflow-hidden"
    >
      <PhotoStack
        key={active ? "playing" : "idle"}
        images={listing.images}
        alt={listing.title}
        active={active}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/75 to-transparent px-4 pt-28 pb-[max(4.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto max-w-[80%]">
          <p className="text-2xl font-semibold tracking-tight text-amber-300">
            {formatPrice(listing.price)}
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {listing.title}{" "}
            <span className="text-base font-normal text-white/70">{listing.year}</span>
          </h2>
          <p className="mt-1 text-sm text-white/80">
            {formatMileage(listing.mileageKm)} · {FUEL_LABEL[listing.fuel]} ·{" "}
            {TRANSMISSION_LABEL[listing.transmission]}
          </p>
          <p className="mt-1 text-sm text-white/70">{listing.location}</p>
          <p className="mt-2 text-sm text-white/55">
            {listing.seller.name} · {SELLER_KIND_LABEL[listing.seller.kind]}
          </p>
          <button type="button" onClick={onOpen} className="mt-3 text-sm font-medium text-white underline">
            Подробнее
          </button>
        </div>
      </div>
      <div className="absolute right-3 bottom-36 z-20">
        <button
          type="button"
          aria-pressed={liked}
          aria-label={liked ? "Убрать из сохранённых" : "Сохранить"}
          onClick={onLike}
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            liked ? "bg-rose-500 text-white" : "bg-black/40 text-white"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
            <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
          </svg>
        </button>
      </div>
    </article>
  );
}
