"use client";

import Link from "next/link";
import { useSession } from "@/components/session-provider";

export function AppHeader({
  overlay = false,
  backHref,
  hideAccount = false,
  onSettings,
}: {
  overlay?: boolean;
  backHref?: string;
  hideAccount?: boolean;
  onSettings?: () => void;
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
      <div className="pointer-events-auto flex items-center gap-2">
        {onSettings ? (
          <button
            type="button"
            aria-label="Настройки"
            onClick={onSettings}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
          >
            <GearIcon />
          </button>
        ) : null}
        {hideAccount ? null : (
          <Link
            href={user ? "/me" : "/login"}
            className="rounded-full bg-white/15 px-3 py-1.5 text-sm text-white backdrop-blur-sm"
          >
            {ready ? (user ? user.name : "Войти") : "…"}
          </Link>
        )}
      </div>
    </header>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.61l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.1 7.1 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.22-1.13.54-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.87a.5.5 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.61l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.5.4 1.04.72 1.63.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.59-.22 1.13-.54 1.63-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"
      />
    </svg>
  );
}
