"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AccountScreen } from "@/components/account-screen";
import { BottomNav, type HomeTab } from "@/components/bottom-nav";
import { PreferencesScreen } from "@/components/preferences-screen";
import { FeedScreen } from "@/components/reels/feed-screen";
import { SearchScreen } from "@/components/search-screen";
import { hasFinishedInterests } from "@/lib/interest-profile";
import { EMPTY_SEARCH, type SearchQuery } from "@/lib/search";

function tabFromQuery(value: string | null): HomeTab | null {
  return value === "profile" || value === "search" ? value : null;
}

export function HomeShell() {
  const params = useSearchParams();
  const queryTab = params.get("tab");
  const requested = tabFromQuery(queryTab);
  const [tab, setTab] = useState<HomeTab>(requested ?? "feed");
  const [settingsOpen, setSettingsOpen] = useState(queryTab === "preferences");
  const [askInterests, setAskInterests] = useState<boolean | null>(null);
  const [profileVersion, setProfileVersion] = useState(0);
  const [feedEpoch, setFeedEpoch] = useState(0);
  const [search, setSearch] = useState<SearchQuery>(EMPTY_SEARCH);

  useEffect(() => {
    setAskInterests(!hasFinishedInterests());
  }, []);

  useEffect(() => {
    if (queryTab === "preferences") {
      setSettingsOpen(true);
      setTab("feed");
      return;
    }
    if (requested) {
      setTab(requested);
      setSettingsOpen(false);
    }
  }, [queryTab, requested]);

  const feedLive = tab === "feed" && !settingsOpen;

  function selectTab(next: HomeTab) {
    setSettingsOpen(false);
    setTab(next);
  }

  return (
    <div className="relative h-full [--nav-h:3.75rem]">
      <div className="h-full" inert={!feedLive || askInterests !== false}>
        <FeedScreen
          suspended={!feedLive}
          search={search}
          reloadToken={feedEpoch}
          onOpenSettings={() => {
            setTab("feed");
            setSettingsOpen(true);
          }}
          onClearSearch={() => setSearch(EMPTY_SEARCH)}
        />
      </div>
      {settingsOpen ? (
        <section aria-label="Предпочтения" className="absolute inset-x-0 top-0 z-40 bg-black bottom-[calc(var(--nav-h)+env(safe-area-inset-bottom))]">
          <PreferencesScreen
            key={profileVersion}
            onDone={() => {
              setSettingsOpen(false);
              setFeedEpoch((value) => value + 1);
            }}
          />
        </section>
      ) : null}
      {askInterests !== false ? (
        <section role="dialog" aria-modal="true" aria-label="Первый выбор предпочтений" className="absolute inset-0 z-50 bg-black">
          {askInterests ? (
            <PreferencesScreen
              intro
              onDone={() => {
                setAskInterests(false);
                setProfileVersion((value) => value + 1);
                setFeedEpoch((value) => value + 1);
              }}
            />
          ) : null}
        </section>
      ) : null}
      {tab === "search" ? (
        <section aria-label="Поиск" className="absolute inset-x-0 top-0 z-40 bg-black bottom-[calc(var(--nav-h)+env(safe-area-inset-bottom))]">
          <SearchScreen
            key={JSON.stringify(search)}
            initial={search}
            onApply={(query) => {
              setSearch(query);
              setSettingsOpen(false);
              setTab("feed");
            }}
          />
        </section>
      ) : null}
      {tab === "profile" ? (
        <section aria-label="Профиль" className="absolute inset-x-0 top-0 z-40 bg-black bottom-[calc(var(--nav-h)+env(safe-area-inset-bottom))]">
          <AccountScreen embedded />
        </section>
      ) : null}
      <BottomNav tab={tab} onChange={selectTab} />
    </div>
  );
}
