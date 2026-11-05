"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ReelSlide } from "@/components/reels/reel-slide";
import { useSession } from "@/components/session-provider";
import {
  formatDate,
  formatMileage,
  formatPrice,
  FUEL_LABEL,
  SELLER_KIND_LABEL,
  TRANSMISSION_LABEL,
} from "@/lib/format";
import { markSeen, SEEN_AFTER_MS } from "@/lib/seen-queue";
import type { Listing } from "@/lib/types";

export function ReelStage({
  listings,
  returnTo,
  backHref,
}: {
  listings: Listing[];
  returnTo: string;
  backHref?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = listings.find((listing) => listing.id === openId) ?? null;

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = slidesRef.current.indexOf(visible.target as HTMLElement);
        if (index >= 0) setActive(index);
      },
      { root, threshold: [0.6, 0.85] },
    );
    slidesRef.current.forEach((element) => {
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [listings]);

  useEffect(() => {
    const listing = listings[active];
    if (!listing || open) return;
    const timer = window.setTimeout(() => markSeen(listing.id), SEEN_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [active, listings, open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select")) return;
      if (event.key === "Escape") {
        setOpenId(null);
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const next = event.key === "ArrowDown" ? active + 1 : active - 1;
      slidesRef.current[next]?.scrollIntoView({ behavior: "smooth" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <div className="relative h-full select-none">
      <AppHeader overlay backHref={backHref} />
      <div
        ref={scrollerRef}
        className={`reel-scroller h-full snap-y snap-mandatory ${
          open ? "overflow-hidden" : "overflow-y-scroll"
        }`}
      >
        {listings.map((listing, index) => (
          <div
            key={listing.id}
            ref={(element) => {
              slidesRef.current[index] = element;
            }}
            className="h-full shrink-0"
          >
            <ReelSlide
              listing={listing}
              active={index === active && !open}
              returnTo={returnTo}
              onOpen={() => setOpenId(listing.id)}
            />
          </div>
        ))}
      </div>
      {open ? <ListingSheet listing={open} returnTo={returnTo} onClose={() => setOpenId(null)} /> : null}
    </div>
  );
}

function ListingSheet({
  listing,
  returnTo,
  onClose,
}: {
  listing: Listing;
  returnTo: string;
  onClose: () => void;
}) {
  const { user } = useSession();
  const router = useRouter();
  const [note, setNote] = useState<string | null>(null);

  function onContact() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(returnTo)}`);
      return;
    }
    setNote("Чат ещё не подключён — он появится вместе с бекендом.");
  }

  const specs = [
    ["Год", String(listing.year)],
    ["Пробег", formatMileage(listing.mileageKm)],
    ["Топливо", FUEL_LABEL[listing.fuel]],
    ["Коробка", TRANSMISSION_LABEL[listing.transmission]],
    ["Город", listing.location],
    ["Продавец", `${listing.seller.name}, ${SELLER_KIND_LABEL[listing.seller.kind]}`],
  ];

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/50" onClick={onClose}>
      <div
        className="max-h-[78%] overflow-y-auto rounded-t-3xl bg-zinc-950 px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xl font-semibold text-amber-300">{formatPrice(listing.price)}</p>
            <h2 className="mt-1 text-lg font-semibold">{listing.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-white/70" aria-label="Закрыть">
            Закрыть
          </button>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {specs.map(([label, value]) => (
            <div key={label}>
              <dt className="text-white/45">{label}</dt>
              <dd className="mt-0.5">{value}</dd>
            </div>
          ))}
        </dl>
        {listing.description ? (
          <p className="mt-4 text-sm leading-6 text-white/80">{listing.description}</p>
        ) : null}
        <p className="mt-3 text-xs text-white/40">Опубликовано {formatDate(listing.createdAt)}</p>
        <button
          type="button"
          onClick={onContact}
          className="mt-5 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black"
        >
          Написать продавцу
        </button>
        {note ? <p className="mt-3 text-sm text-white/70">{note}</p> : null}
      </div>
    </div>
  );
}
