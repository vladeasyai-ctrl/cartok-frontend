/**
 * Контракт, на который опирается интерфейс.
 * Когда появится отдельный бекенд, формы этих объектов должны совпасть с его ответами.
 */

export type Fuel = "petrol" | "diesel" | "hybrid" | "electric" | "lpg";

export type Transmission = "manual" | "automatic";

export type SellerKind = "private" | "dealer";

export type PublicUser = {
  id: string;
  email: string;
  name: string;
};

export type Seller = {
  id: string;
  name: string;
  kind: SellerKind;
};

/** null — источник (otomoto) не сообщил значение. */
export type Listing = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number | null;
  price: number | null;
  currency: string;
  mileageKm: number | null;
  fuel: Fuel | null;
  transmission: Transmission | null;
  location: string;
  description: string;
  images: string[];
  seller: Seller;
  createdAt: string | null;
};

export type CreateListingInput = {
  make: string;
  model: string;
  year: number;
  price: number;
  mileageKm: number;
  fuel: Fuel;
  transmission: Transmission;
  location: string;
  description: string;
};

export const FUELS: Fuel[] = ["petrol", "diesel", "hybrid", "electric", "lpg"];

export const TRANSMISSIONS: Transmission[] = ["manual", "automatic"];
