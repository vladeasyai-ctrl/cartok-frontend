"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PublicUser } from "@/lib/types";

type SessionValue = {
  user: PublicUser | null;
  ready: boolean;
  setUser: (user: PublicUser | null) => void;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    if (!response.ok) {
      setUser(null);
      setReady(true);
      return;
    }
    const data = (await response.json()) as { user: PublicUser };
    setUser(data.user);
    setReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (cancelled) return;
        if (!response.ok) {
          setUser(null);
          setReady(true);
          return;
        }
        const data = (await response.json()) as { user: PublicUser };
        setUser(data.user);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ user, ready, setUser, refresh }),
    [user, ready, refresh],
  );

  return (
    <SessionContext.Provider value={value}>
      <div className="h-full">{children}</div>
    </SessionContext.Provider>
  );
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
