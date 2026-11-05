"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, fieldClass, PageShell } from "@/components/page-shell";
import { FUEL_LABEL, TRANSMISSION_LABEL } from "@/lib/format";
import { FUELS, TRANSMISSIONS, type Fuel, type Transmission } from "@/lib/types";
import { parseListing } from "@/lib/validate";

export function SellForm() {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2018");
  const [price, setPrice] = useState("");
  const [mileageKm, setMileageKm] = useState("");
  const [fuel, setFuel] = useState<Fuel>("petrol");
  const [transmission, setTransmission] = useState<Transmission>("manual");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = parseListing({
      make,
      model,
      year,
      price,
      mileageKm,
      fuel,
      transmission,
      location,
      description,
    });
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Не удалось опубликовать");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Нет связи с сервером");
    } finally {
      setPending(false);
    }
  }

  return (
    <PageShell title="Новое объявление" backHref="/me">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-white/60">
          Фото пока подставляются сами: загрузка с телефона появится, когда будет хранилище на бекенде.
          В ленте эти картинки всё равно листаются.
        </p>
        <Field label="Марка">
          <input className={fieldClass} value={make} onChange={(event) => setMake(event.target.value)} />
        </Field>
        <Field label="Модель">
          <input className={fieldClass} value={model} onChange={(event) => setModel(event.target.value)} />
        </Field>
        <Field label="Год">
          <input
            className={fieldClass}
            inputMode="numeric"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          />
        </Field>
        <Field label="Цена, zł">
          <input
            className={fieldClass}
            inputMode="numeric"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </Field>
        <Field label="Пробег, км">
          <input
            className={fieldClass}
            inputMode="numeric"
            value={mileageKm}
            onChange={(event) => setMileageKm(event.target.value)}
          />
        </Field>
        <Field label="Топливо">
          <select
            className={fieldClass}
            value={fuel}
            onChange={(event) => setFuel(event.target.value as Fuel)}
          >
            {FUELS.map((item) => (
              <option key={item} value={item}>
                {FUEL_LABEL[item]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Коробка">
          <select
            className={fieldClass}
            value={transmission}
            onChange={(event) => setTransmission(event.target.value as Transmission)}
          >
            {TRANSMISSIONS.map((item) => (
              <option key={item} value={item}>
                {TRANSMISSION_LABEL[item]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Город">
          <input
            className={fieldClass}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </Field>
        <Field label="Описание">
          <textarea
            className={`${fieldClass} min-h-28 resize-none`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
        >
          {pending ? "Публикуем…" : "Опубликовать"}
        </button>
      </form>
    </PageShell>
  );
}
