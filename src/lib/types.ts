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
  /** Лайк текущего пользователя; приходит только в персональной ленте. */
  liked?: boolean;
  /** Ссылка на объявление у источника. Пока бекенд её не отдаёт, поля нет. */
  sourceUrl?: string;
};

export type ActivityKind = "view" | "open" | "like" | "unlike";

/** dwellMs — сколько карточка была на экране, только для view. */
export type ActivityEvent = { listingId: string; kind: ActivityKind; dwellMs?: number };

export const ACTIVITY_KINDS: ActivityKind[] = ["view", "open", "like", "unlike"];
export const ACTIVITY_BATCH_LIMIT = 50;

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

/** model "" — подходит вся марка. Названия как у otomoto, с ними сравниваются объявления. */
export type PreferenceChoice = { make: string; model: string };

/** priorities[0] — приоритет 1. Фильтры общие на всю ленту, null — граница не задана. */
export type Preferences = {
  priorities: PreferenceChoice[][];
  fuels: Fuel[];
  yearFrom: number | null;
  yearTo: number | null;
  mileageFrom: number | null;
  mileageTo: number | null;
};

export const PRIORITY_COUNT = 3;
export const CHOICES_PER_PRIORITY = 30;

/**
 * Три вопроса, в каждом не больше трёх наборов.
 * unchecked — id листьев, которые пользователь снял; пустой список значит набор целиком.
 * В предпочтения уходят только листья с маркой otomoto, сам опрос остаётся в браузере.
 */
export type InterestSetPick = { setId: string; unchecked: string[] };

export type InterestProfile = {
  often: InterestSetPick[];
  rarely: InterestSetPick[];
  also: InterestSetPick[];
};

export const MAX_INTEREST_SETS = 3;

export const FUELS: Fuel[] = ["petrol", "diesel", "hybrid", "electric", "lpg"];

export const TRANSMISSIONS: Transmission[] = ["manual", "automatic"];
