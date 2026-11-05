"use client";

import Link from "next/link";
import { useSession } from "@/components/session-provider";

export function AppHeader({
  overlay = false,
  backHref,
  hideAccount = false,
}: {
  overlay?: boolean;
  backHref?: string;
  hideAccount?: boolean;
}) {
  const { user, ready } = useSession();

  return (
    <header
      className={
        overlay
          ? "pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-8"
          : "flex shrink-0 items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3"
      }
    >
      {backHref ? (
        <Link href={backHref} className="pointer-events-auto text-sm text-white">
          Назад
        </Link>
      ) : (
        <Link href="/" className="pointer-events-auto text-lg font-semibold tracking-tight text-white">
          cartok
        </Link>
      )}
      {hideAccount ? (
        <span />
      ) : (
        <Link
          href={user ? "/me" : "/login"}
          className="pointer-events-auto rounded-full bg-white/15 px-3 py-1.5 text-sm text-white backdrop-blur-sm"
        >
          {ready ? (user ? user.name : "Войти") : "…"}
        </Link>
      )}
    </header>
  );
}
