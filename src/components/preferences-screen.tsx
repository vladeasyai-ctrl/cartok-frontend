"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";
import {
  deselectInterestSet,
  emptyInterestProfile,
  findInterestSet,
  INTEREST_SETS,
  INTEREST_STEPS,
  selectInterestSet,
  takenElsewhere,
  toggleInterestLeaves,
} from "@/lib/interest-sets";
import { loadInterestProfile, publishInterestProfile, saveInterestProfile } from "@/lib/interest-profile";
import { MAX_INTEREST_SETS } from "@/lib/types";
import type { InterestProfile } from "@/lib/types";

export function PreferencesScreen({ intro = false, onDone }: { intro?: boolean; onDone?: () => void }) {
  const { user } = useSession();
  const [stepIndex, setStepIndex] = useState(0);
  const [profile, setProfile] = useState<InterestProfile>(emptyInterestProfile);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadInterestProfile();
    if (saved) setProfile(saved.profile);
    setReady(true);
  }, []);

  const step = INTEREST_STEPS[stepIndex];
  const picks = profile[step.key];
  const hidden = new Set(takenElsewhere(profile, step.key));
  const visible = INTEREST_SETS.filter((item) => !hidden.has(item.id));
  const last = stepIndex === INTEREST_STEPS.length - 1;
  const chosen = picks.flatMap((pick) => {
    const set = findInterestSet(pick.setId);
    return set ? [{ pick, set }] : [];
  });

  function go(next: number) {
    setNotice(null);
    setStepIndex(next);
  }

  async function finish(doneProfile: InterestProfile) {
    if (saving) return;
    saveInterestProfile(doneProfile, true);
    if (!user) {
      onDone?.();
      return;
    }
    setSaving(true);
    const ok = await publishInterestProfile(doneProfile);
    setSaving(false);
    if (!ok) {
      setNotice("Не удалось сохранить на сервере. Выбор остался на этом устройстве");
      return;
    }
    onDone?.();
  }

  function toggleSet(setId: string) {
    const selected = picks.some((pick) => pick.setId === setId);
    if (selected) {
      setNotice(null);
      setProfile((current) => deselectInterestSet(current, step.key, setId));
      return;
    }
    if (picks.length >= MAX_INTEREST_SETS) {
      setNotice("Можно выбрать не больше трёх наборов");
      return;
    }
    setNotice(null);
    setProfile((current) => selectInterestSet(current, step.key, setId));
  }

  function toggleModel(setId: string, modelId: string, turnOn: boolean) {
    setNotice(null);
    setProfile((current) => toggleInterestLeaves(current, step.key, setId, [modelId], turnOn));
  }

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <p className="text-sm text-white/60">Загрузка…</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs tracking-wide text-white/45 uppercase">
            {intro ? "Шаг" : "Предпочтения"} {stepIndex + 1} из {INTEREST_STEPS.length}
          </p>
          {intro ? (
            <button type="button" onClick={() => void finish(profile)} disabled={saving} className="text-sm text-white/55 disabled:opacity-40">
              Пропустить
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {INTEREST_STEPS.map((item, index) => (
            <span key={item.key} className={`h-1 flex-1 rounded-full ${index <= stepIndex ? "bg-white" : "bg-white/15"}`} />
          ))}
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">{step.title}</h1>
        <p className="mt-2 text-sm text-white/50">{step.lead}</p>
        <p className="mt-3 text-xs text-white/40">
          Выбрано {picks.length} из {MAX_INTEREST_SETS}
        </p>
        {notice ? (
          <p role="status" className="mt-2 text-sm text-amber-200">
            {notice}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-x-2 gap-y-3 pt-1">
          {visible.map((item) => {
            const selected = picks.some((pick) => pick.setId === item.id);
            const blocked = !selected && picks.length >= MAX_INTEREST_SETS;
            return (
              <Oval
                key={item.id}
                icon={item.icon}
                label={item.title}
                pressed={selected}
                quiet={blocked}
                onClick={() => toggleSet(item.id)}
              />
            );
          })}
        </div>
        {visible.length === 0 ? (
          <p className="mt-6 text-sm text-white/50">Все наборы уже выбраны на предыдущих шагах.</p>
        ) : null}

        {chosen.map(({ pick, set }) => (
          <section key={set.id} className="mt-5">
            <p className="text-xs text-white/45">
              <span aria-hidden="true">{set.icon} </span>
              {set.title}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {set.models.map((model) => {
                const on = !pick.unchecked.includes(model.id);
                return (
                  <Oval
                    key={model.id}
                    label={model.label}
                    pressed={on}
                    onClick={() => toggleModel(set.id, model.id, !on)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="shrink-0 border-t border-white/10 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {last ? (
          <p className="mb-3 text-xs leading-5 text-white/40">
            Марки с известным именем на otomoto попадут в ленту после входа. Остальные модели пока только на этом устройстве.
          </p>
        ) : null}
        <div className="flex gap-2">
          {stepIndex > 0 ? (
            <button type="button" onClick={() => go(stepIndex - 1)} className="rounded-full bg-white/10 px-4 py-3 text-sm font-medium">
              Назад
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => (last ? void finish(profile) : go(stepIndex + 1))}
            disabled={saving}
            className="flex-1 rounded-full bg-white py-3 text-sm font-semibold text-black disabled:opacity-40"
          >
            {last ? "Готово" : "Дальше"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Oval({
  icon,
  label,
  pressed,
  quiet = false,
  onClick,
}: {
  icon?: string;
  label: string;
  pressed: boolean;
  quiet?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`relative inline-flex max-w-full items-center gap-1.5 rounded-full bg-transparent px-3.5 py-2 text-left text-sm leading-5 font-medium ring-1 ${
        pressed ? "text-emerald-400 ring-emerald-400" : "text-white ring-white/30"
      } ${quiet ? "opacity-40" : ""}`}
    >
      {icon ? (
        <span aria-hidden="true" className="text-base leading-none">
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
      {pressed ? (
        <span aria-hidden="true" className="absolute -top-1.5 -right-1 text-xs leading-none text-emerald-400">
          ✓
        </span>
      ) : null}
    </button>
  );
}
