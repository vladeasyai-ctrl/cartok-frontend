import type { Fuel, Listing } from "@/lib/types";

/** Локальный фильтр ленты. Пустой список и null — граница не задана. */
export type SearchQuery = {
  makes: string[];
  fuels: Fuel[];
  yearFrom: number | null;
  yearTo: number | null;
  mileageFrom: number | null;
  mileageTo: number | null;
};

export const EMPTY_SEARCH: SearchQuery = {
  makes: [],
  fuels: [],
  yearFrom: null,
  yearTo: null,
  mileageFrom: null,
  mileageTo: null,
};

export function isSearchActive(query: SearchQuery) {
  return (
    query.makes.length > 0 ||
    query.fuels.length > 0 ||
    query.yearFrom !== null ||
    query.yearTo !== null ||
    query.mileageFrom !== null ||
    query.mileageTo !== null
  );
}

export function matchesSearch(listing: Listing, query: SearchQuery) {
  if (query.makes.length > 0) {
    const make = listing.make.toLowerCase();
    if (!query.makes.some((item) => item.toLowerCase() === make)) return false;
  }
  if (query.fuels.length > 0 && (!listing.fuel || !query.fuels.includes(listing.fuel))) return false;
  if (query.yearFrom !== null && (listing.year === null || listing.year < query.yearFrom)) return false;
  if (query.yearTo !== null && (listing.year === null || listing.year > query.yearTo)) return false;
  if (query.mileageFrom !== null && (listing.mileageKm === null || listing.mileageKm < query.mileageFrom)) return false;
  if (query.mileageTo !== null && (listing.mileageKm === null || listing.mileageKm > query.mileageTo)) return false;
  return true;
}
