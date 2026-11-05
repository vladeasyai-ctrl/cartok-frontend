"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-header";

export function ScreenStatus({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg text-white">{title}</p>
      {children}
    </div>
  );
}

export function PageShell({
  title,
  children,
  backHref = "/",
  hideAccount = false,
}: {
  title: string;
  children: React.ReactNode;
  backHref?: string;
  hideAccount?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <AppHeader backHref={backHref} hideAccount={hideAccount} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10">
        <h1 className="mb-5 text-2xl font-semibold tracking-tight">{title}</h1>
        {children}
      </div>
    </div>
  );
}

export const fieldClass =
  "mt-1 w-full rounded-2xl bg-zinc-900 px-3 py-3 text-base text-white outline-none ring-1 ring-white/10 focus:ring-white/40";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm text-white/70">
      {label}
      {children}
    </label>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-amber-300">
      {children}
    </Link>
  );
}
