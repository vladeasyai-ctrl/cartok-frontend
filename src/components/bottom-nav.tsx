"use client";

export type HomeTab = "feed" | "search" | "profile";

export function BottomNav({ tab, onChange }: { tab: HomeTab; onChange: (tab: HomeTab) => void }) {
  return (
    <nav
      aria-label="Разделы"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex h-[calc(var(--nav-h)+env(safe-area-inset-bottom))] items-stretch justify-around bg-transparent px-6 pb-[env(safe-area-inset-bottom)]"
    >
      <NavButton label="Лента" active={tab === "feed"} onClick={() => onChange("feed")}>
        <HomeIcon active={tab === "feed"} />
      </NavButton>
      <NavButton label="Поиск" active={tab === "search"} onClick={() => onChange("search")}>
        <SearchIcon active={tab === "search"} />
      </NavButton>
      <NavButton label="Профиль" active={tab === "profile"} onClick={() => onChange("profile")}>
        <ProfileIcon active={tab === "profile"} />
      </NavButton>
    </nav>
  );
}

function NavButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`pointer-events-auto flex w-16 items-center justify-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] ${
        active ? "text-white" : "text-white/80"
      }`}
    >
      {children}
    </button>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path
        d="M4.2 10.4 12 3.8l7.8 6.6V20a1 1 0 0 1-1 1h-4.6v-6.2h-4.4V21H5.2a1 1 0 0 1-1-1z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={active ? 0 : 1.7}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true" fill="none">
      <circle cx="10.5" cy="10.5" r="6.2" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} />
      <path d="M15.2 15.2 20 20" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true" fill="none">
      <circle cx="12" cy="8" r="3.1" stroke="currentColor" strokeWidth={active ? 2 : 1.7} fill={active ? "currentColor" : "none"} />
      <path
        d="M5.2 19.4c1.3-2.8 3.6-4.2 6.8-4.2s5.5 1.4 6.8 4.2"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}
