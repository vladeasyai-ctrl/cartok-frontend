"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ScreenStatus } from "@/components/page-shell";

const BackendReadyContext = createContext(true);

export function useBackendReady() {
  return useContext(BackendReadyContext);
}

/** Дольше этого бэкенд считаем недоступным и перестаём его будить. */
const BUDGET_MS = 120_000;
/** Один запрос не короче холодного старта: Cloud Run отдаёт его сервису, когда под готов. */
const ATTEMPT_MS = 60_000;

type Phase = "loading" | "ready" | "down";

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export function BackendGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const deadline = Date.now() + BUDGET_MS;
    let cancelled = false;

    const run = async () => {
      while (!cancelled) {
        const remaining = deadline - Date.now();
        if (remaining < 1500) {
          setPhase("down");
          return;
        }
        const timeoutMs = Math.min(ATTEMPT_MS, remaining);
        const started = Date.now();
        try {
          const response = await fetch(`/api/health?timeoutMs=${timeoutMs}`, {
            cache: "no-store",
            signal: controller.signal,
          });
          if (cancelled) return;
          if (response.ok) {
            setPhase("ready");
            return;
          }
        } catch {
          if (cancelled) return;
        }
        if (Date.now() - started < 2000) {
          try {
            await delay(1500, controller.signal);
          } catch {
            return;
          }
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [attempt]);

  const overlay =
    phase === "down" ? (
      <ScreenStatus title="Приложение не загрузилось">
        <p className="max-w-xs text-sm text-white/60">Сервер не ответил за две минуты.</p>
        <button
          type="button"
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
          onClick={() => {
            setPhase("loading");
            setAttempt((value) => value + 1);
          }}
        >
          Повторить
        </button>
      </ScreenStatus>
    ) : phase === "loading" ? (
      <ScreenStatus title="Загружаем приложение">
        <span className="motion-safe:animate-pulse text-sm text-white/50">Сервер просыпается</span>
      </ScreenStatus>
    ) : null;

  return (
    <BackendReadyContext.Provider value={phase === "ready"}>
      <div className="relative h-full">
        <div className="h-full" inert={phase !== "ready"}>
          {children}
        </div>
        {overlay ? <div className="absolute inset-0 z-50 bg-black">{overlay}</div> : null}
      </div>
    </BackendReadyContext.Provider>
  );
}
