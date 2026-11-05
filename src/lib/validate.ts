import type { CreateListingInput, Fuel, Transmission } from "@/lib/types";
import { FUELS, TRANSMISSIONS } from "@/lib/types";

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
