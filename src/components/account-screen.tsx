"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { PageShell, TextLink } from "@/components/page-shell";
import { formatPrice } from "@/lib/format";
import type { Listing } from "@/lib/types";

export function AccountScreen() {
  const { user, ready, setUser } = useSession();
  const router = useRouter();
  const [mine, setMine] = useState<Listing[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/listings", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return { listings: [] as Listing[] };
        return (await response.json()) as { listings: Listing[] };
      })
      .then((data) => {
        if (!cancelled) {
          setMine(data.listings.filter((listing) => listing.seller.id === user.id));
        }
      })
      .catch(() => {
        if (!cancelled) setMine([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <PageShell title="Профиль">
      {!ready ? <p className="text-sm text-white/60">Загрузка…</p> : null}
      {user ? (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-lg font-medium">{user.name}</p>
            <p className="text-sm text-white/60">{user.email}</p>
          </div>
          <TextLink href="/sell">Новое объявление</TextLink>
          <section>
            <h2 className="text-sm text-white/50">Мои объявления</h2>
            {mine.length === 0 ? (
              <p className="mt-2 text-sm text-white/70">Пока пусто. Новое объявление попадёт в начало ленты.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {mine.map((listing) => (
                  <li key={listing.id}>
                    <TextLink href={`/listing/${listing.id}`}>
                      {listing.title} · {formatPrice(listing.price, listing.currency)}
                    </TextLink>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <button
            type="button"
            onClick={logout}
            className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium"
          >
            Выйти
          </button>
        </div>
      ) : ready ? (
        <TextLink href="/login?next=/me">Войти</TextLink>
      ) : null}
    </PageShell>
  );
}
