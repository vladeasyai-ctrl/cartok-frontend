"use client";

import { useState } from "react";
import {
  CheckRow,
  DualRange,
  MILEAGE_MAX,
  MILEAGE_MIN,
  MILEAGE_STEP,
  YEAR_MAX,
  YEAR_MIN,
} from "@/components/filter-controls";
import { CATALOG } from "@/lib/catalog";
import { FUEL_LABEL, formatMileage } from "@/lib/format";
import type { SearchQuery } from "@/lib/search";
import { FUELS } from "@/lib/types";
import type { Fuel } from "@/lib/types";

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function SearchScreen({ initial, onApply }: { initial: SearchQuery; onApply: (query: SearchQuery) => void }) {
  const [makes, setMakes] = useState<string[]>(initial.makes);
  const [fuels, setFuels] = useState<Fuel[]>(initial.fuels);
  const [yearLow, setYearLow] = useState(initial.yearFrom ?? YEAR_MIN);
  const [yearHigh, setYearHigh] = useState(initial.yearTo ?? YEAR_MAX);
  const [mileageLow, setMileageLow] = useState(initial.mileageFrom ?? MILEAGE_MIN);
  const [mileageHigh, setMileageHigh] = useState(initial.mileageTo ?? MILEAGE_MAX);

  function toggleMake(make: string) {
    setMakes((current) => (current.includes(make) ? current.filter((item) => item !== make) : [...current, make]));
  }

  function toggleFuel(fuel: Fuel) {
    setFuels((current) => (current.includes(fuel) ? current.filter((item) => item !== fuel) : [...current, fuel]));
  }

  return (
    <div className="relative h-full overflow-y-auto px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <h1 className="text-2xl font-semibold tracking-tight">Поиск</h1>
      <p className="mt-1 text-sm text-white/50">Отметьте несколько марок и границы. Пустое поле значит «любое».</p>

      <fieldset className="mt-6">
        <legend className="mb-2 text-sm text-white/50">Марки</legend>
        <div className="grid grid-cols-2 gap-2">
          {CATALOG.map((item) => (
            <CheckRow
              key={item.make}
              checked={makes.includes(item.make)}
              onChange={() => toggleMake(item.make)}
              label={item.make}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="mb-2 text-sm text-white/50">Топливо</legend>
        <div className="grid grid-cols-3 gap-2">
          {FUELS.map((fuel) => (
            <CheckRow
              key={fuel}
              checked={fuels.includes(fuel)}
              onChange={() => toggleFuel(fuel)}
              label={capitalize(FUEL_LABEL[fuel])}
              compact
            />
          ))}
        </div>
      </fieldset>

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-sm text-white/50">Год выпуска</h2>
          <p className="text-sm">
            {yearLow} — {yearHigh}
          </p>
        </div>
        <DualRange
          min={YEAR_MIN}
          max={YEAR_MAX}
          step={1}
          low={yearLow}
          high={yearHigh}
          lowLabel="Год от"
          highLabel="Год до"
          format={(value) => String(value)}
          onLow={setYearLow}
          onHigh={setYearHigh}
        />
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-sm text-white/50">Пробег</h2>
          <p className="text-sm">
            {formatMileage(mileageLow)} — {mileageHigh >= MILEAGE_MAX ? "без ограничения" : formatMileage(mileageHigh)}
          </p>
        </div>
        <DualRange
          min={MILEAGE_MIN}
          max={MILEAGE_MAX}
          step={MILEAGE_STEP}
          low={mileageLow}
          high={mileageHigh}
          lowLabel="Пробег от"
          highLabel="Пробег до"
          format={(value) => formatMileage(value) ?? ""}
          onLow={setMileageLow}
          onHigh={setMileageHigh}
        />
      </section>

      <div className="sticky bottom-0 mt-8 -mx-5 bg-gradient-to-t from-black via-black to-transparent px-5 pt-6 pb-5">
        <button
          type="button"
          onClick={() =>
            onApply({
              makes,
              fuels,
              yearFrom: yearLow > YEAR_MIN ? yearLow : null,
              yearTo: yearHigh < YEAR_MAX ? yearHigh : null,
              mileageFrom: mileageLow > MILEAGE_MIN ? mileageLow : null,
              mileageTo: mileageHigh < MILEAGE_MAX ? mileageHigh : null,
            })
          }
          className="w-full rounded-2xl bg-white py-3 text-sm font-semibold text-black"
        >
          Показать
        </button>
      </div>
    </div>
  );
}
