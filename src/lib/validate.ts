import type {
  ActivityEvent,
  ActivityKind,
  CreateListingInput,
  Fuel,
  PreferenceChoice,
  Preferences,
  Transmission,
} from "@/lib/types";
import {
  ACTIVITY_BATCH_LIMIT,
  ACTIVITY_KINDS,
  CHOICES_PER_PRIORITY,
  FUELS,
  PRIORITY_COUNT,
  TRANSMISSIONS,
} from "@/lib/types";

export type Parsed<T> = { ok: true; data: T } | { ok: false; error: string };

const fuelSet = new Set<string>(FUELS);
const gearSet = new Set<string>(TRANSMISSIONS);

function asRecord(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  return body as Record<string, unknown>;
}

function cleanLine(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim().replace(/\s+/g, " ");
  if (!text || text.length > max) return null;
  return text;
}

function integerIn(value: unknown, min: number, max: number): number | null {
  const number =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;
  if (!Number.isInteger(number) || number < min || number > max) return null;
  return number;
}

function parseCredentials(
  body: unknown,
): Parsed<{ email: string; password: string }> {
  const record = asRecord(body);
  if (!record) return { ok: false, error: "Некорректный запрос" };

  const email = cleanLine(record.email, 120)?.toLowerCase();
  const password = typeof record.password === "string" ? record.password : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Укажите корректный email" };
  }
  if (password.length < 8 || password.length > 72) {
    return { ok: false, error: "Пароль должен быть от 8 до 72 символов" };
  }
  return { ok: true, data: { email, password } };
}

export function parseLogin(body: unknown) {
  return parseCredentials(body);
}

export function parseRegister(
  body: unknown,
): Parsed<{ email: string; password: string; name: string }> {
  const credentials = parseCredentials(body);
  if (!credentials.ok) return credentials;

  const record = asRecord(body);
  const name = cleanLine(record?.name, 40);
  if (!name || name.length < 2) {
    return { ok: false, error: "Имя должно быть от 2 до 40 символов" };
  }
  return { ok: true, data: { ...credentials.data, name } };
}

export function parseListing(body: unknown): Parsed<CreateListingInput> {
  const record = asRecord(body);
  if (!record) return { ok: false, error: "Некорректный запрос" };

  const make = cleanLine(record.make, 40);
  const model = cleanLine(record.model, 40);
  const location = cleanLine(record.location, 60);
  const year = integerIn(record.year, 1970, 2027);
  const price = integerIn(record.price, 1, 50_000_000);
  const mileageKm = integerIn(record.mileageKm, 0, 2_000_000);
  const fuel = typeof record.fuel === "string" ? record.fuel : "";
  const transmission =
    typeof record.transmission === "string" ? record.transmission : "";

  let description = "";
  if (typeof record.description === "string") {
    description = record.description.trim();
    if (description.length > 2000) {
      return { ok: false, error: "Описание длиннее 2000 символов" };
    }
  } else if (record.description != null && record.description !== "") {
    return { ok: false, error: "Некорректное описание" };
  }

  if (!make) return { ok: false, error: "Укажите марку" };
  if (!model) return { ok: false, error: "Укажите модель" };
  if (year == null) return { ok: false, error: "Год должен быть от 1970 до 2027" };
  if (price == null) return { ok: false, error: "Укажите цену в злотых" };
  if (mileageKm == null) return { ok: false, error: "Укажите пробег в километрах" };
  if (!location) return { ok: false, error: "Укажите город" };
  if (!fuelSet.has(fuel)) return { ok: false, error: "Выберите топливо" };
  if (!gearSet.has(transmission)) return { ok: false, error: "Выберите коробку" };

  return {
    ok: true,
    data: {
      make,
      model,
      year,
      price,
      mileageKm,
      location,
      description,
      fuel: fuel as Fuel,
      transmission: transmission as Transmission,
    },
  };
}

const activityKinds = new Set<string>(ACTIVITY_KINDS);
const listingIdPattern = /^[A-Za-z0-9_-]{1,80}$/;
const MAX_DWELL_MS = 10 * 60 * 1000;

/** Битые события отбрасываются поштучно: это статистика, из-за одного не стоит терять пачку. */
export function parseActivity(body: unknown): Parsed<ActivityEvent[]> {
  const record = asRecord(body);
  if (!record || !Array.isArray(record.events) || record.events.length > ACTIVITY_BATCH_LIMIT) {
    return { ok: false, error: "Некорректный запрос" };
  }
  const events: ActivityEvent[] = [];
  for (const item of record.events) {
    const event = asRecord(item);
    if (!event || typeof event.listingId !== "string" || !listingIdPattern.test(event.listingId)) continue;
    if (typeof event.kind !== "string" || !activityKinds.has(event.kind)) continue;
    const kind = event.kind as ActivityKind;
    if (kind !== "view") {
      events.push({ listingId: event.listingId, kind });
      continue;
    }
    const dwell = typeof event.dwellMs === "number" && Number.isFinite(event.dwellMs) ? Math.round(event.dwellMs) : 0;
    if (dwell <= 0) continue;
    events.push({ listingId: event.listingId, kind, dwellMs: Math.min(dwell, MAX_DWELL_MS) });
  }
  return { ok: true, data: events };
}

/** undefined — значение есть, но вне диапазона. */
function optionalIntegerIn(value: unknown, min: number, max: number): number | null | undefined {
  if (value === null || value === undefined) return null;
  return integerIn(value, min, max) ?? undefined;
}

function parseRange(
  record: Record<string, unknown>,
  fromKey: string,
  toKey: string,
  min: number,
  max: number,
  label: string,
): Parsed<{ from: number | null; to: number | null }> {
  const from = optionalIntegerIn(record[fromKey], min, max);
  const to = optionalIntegerIn(record[toKey], min, max);
  if (from === undefined || to === undefined) {
    return { ok: false, error: `${label}: значение вне диапазона` };
  }
  if (from !== null && to !== null && from > to) {
    return { ok: false, error: `${label}: «от» больше, чем «до»` };
  }
  return { ok: true, data: { from, to } };
}

export function parsePreferences(body: unknown): Parsed<Preferences> {
  const record = asRecord(body);
  if (!record || !Array.isArray(record.priorities) || record.priorities.length > PRIORITY_COUNT) {
    return { ok: false, error: "Некорректный запрос" };
  }

  const taken = new Set<string>();
  const priorities: PreferenceChoice[][] = [];
  for (let index = 0; index < PRIORITY_COUNT; index++) {
    const raw: unknown = record.priorities[index] ?? [];
    if (!Array.isArray(raw)) return { ok: false, error: "Некорректный запрос" };
    const choices: PreferenceChoice[] = [];
    for (const item of raw) {
      const choice = asRecord(item);
      const make = cleanLine(choice?.make, 40);
      const model = choice?.model === "" || choice?.model == null ? "" : cleanLine(choice.model, 60);
      if (!make || model === null) return { ok: false, error: "Укажите марку" };
      const key = `${make.toLowerCase()}\n${model.toLowerCase()}`;
      if (taken.has(key)) continue;
      taken.add(key);
      choices.push({ make, model });
    }
    if (choices.length > CHOICES_PER_PRIORITY) {
      return { ok: false, error: `В приоритете не больше ${CHOICES_PER_PRIORITY} вариантов` };
    }
    priorities.push(choices);
  }

  const rawFuels: unknown[] = Array.isArray(record.fuels) ? record.fuels : [];
  if (!rawFuels.every((fuel) => typeof fuel === "string" && fuelSet.has(fuel))) {
    return { ok: false, error: "Неизвестное топливо" };
  }
  const fuels = [...new Set(rawFuels as Fuel[])];

  const year = parseRange(record, "yearFrom", "yearTo", 1950, 2035, "Год выпуска");
  if (!year.ok) return year;
  const mileage = parseRange(record, "mileageFrom", "mileageTo", 0, 2_000_000, "Пробег");
  if (!mileage.ok) return mileage;

  return {
    ok: true,
    data: {
      priorities,
      fuels,
      yearFrom: year.data.from,
      yearTo: year.data.to,
      mileageFrom: mileage.data.from,
      mileageTo: mileage.data.to,
    },
  };
}
