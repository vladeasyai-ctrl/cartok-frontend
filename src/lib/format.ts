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

export function formatPrice(amount: number): string {
  return `${priceFormat.format(amount)} zł`;
}

export function formatMileage(km: number): string {
  return `${mileageFormat.format(km)} км`;
}

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}
