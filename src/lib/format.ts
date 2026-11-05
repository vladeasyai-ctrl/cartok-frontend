import type { Fuel, SellerKind, Transmission } from "@/lib/types";

const priceFormat = new Intl.NumberFormat("ru-RU");
const mileageFormat = new Intl.NumberFormat("ru-RU");
const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

export const FUEL_LABEL: Record<Fuel, string> = {
  petrol: "бензин",
  diesel: "дизель",
  hybrid: "гибрид",
  electric: "электро",
  lpg: "газ",
};

export const TRANSMISSION_LABEL: Record<Transmission, string> = {
  manual: "механика",
  automatic: "автомат",
};

export const SELLER_KIND_LABEL: Record<SellerKind, string> = {
  private: "частное лицо",
  dealer: "дилер",
};

const CURRENCY_SIGN: Record<string, string> = {
  PLN: "zł",
  EUR: "€",
  USD: "$",
};

export function formatPrice(amount: number | null, currency = "PLN"): string {
  if (amount === null) return "Цена не указана";
  return `${priceFormat.format(amount)} ${CURRENCY_SIGN[currency] ?? currency}`;
}

export function formatMileage(km: number | null): string | null {
  return km === null ? null : `${mileageFormat.format(km)} км`;
}

export function formatDate(iso: string | null): string | null {
  return iso ? dateFormat.format(new Date(iso)) : null;
}
