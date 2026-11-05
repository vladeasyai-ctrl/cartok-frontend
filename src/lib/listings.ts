import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createLock } from "@/lib/lock";
import type { CreateListingInput, Listing, PublicUser } from "@/lib/types";

/**
 * Объявления: постоянные примеры в коде + созданные пользователем в data/listings.json.
 * Загрузка своих фото здесь намеренно не делается — для неё нужен object storage (на Vercel это Blob).
 */

const locked = createLock();
const filePath = path.join(process.cwd(), "data", "listings.json");

function photo(id: string, crop: "center" | "top" | "bottom" | "left" | "right" = "center") {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&h=1400&q=75&crop=${crop}`;
}

const SEED: Listing[] = [
  {
    id: "lst_mustang",
    title: "Ford Mustang",
    make: "Ford",
    model: "Mustang",
    year: 2018,
    price: 112000,
    currency: "PLN",
    mileageKm: 64000,
    fuel: "petrol",
    transmission: "automatic",
    location: "Warszawa",
    description:
      "Купе в хорошем состоянии, один владелец. Сервис у дилера, летняя и зимняя резина. Осмотр в Варшаве в будни после 17:00.",
    images: [
      photo("photo-1494976388531-d1058494cdd8", "center"),
      photo("photo-1494976388531-d1058494cdd8", "left"),
      photo("photo-1494976388531-d1058494cdd8", "right"),
      photo("photo-1494976388531-d1058494cdd8", "top"),
    ],
    seller: { id: "seller_anna", name: "Anna", kind: "private" },
    createdAt: "2026-10-02T09:00:00.000Z",
  },
  {
    id: "lst_porsche",
    title: "Porsche 911",
    make: "Porsche",
    model: "911",
    year: 2016,
    price: 389000,
    currency: "PLN",
    mileageKm: 72000,
    fuel: "petrol",
    transmission: "automatic",
    location: "Kraków",
    description:
      "Заднееприводное купе, полная история обслуживания. Небольшой окрас заднего бампера после парковки. Торг на месте.",
    images: [
      photo("photo-1503376780353-7e6692767b70", "center"),
      photo("photo-1503376780353-7e6692767b70", "top"),
      photo("photo-1503376780353-7e6692767b70", "bottom"),
    ],
    seller: { id: "seller_dealer_krk", name: "Atelier Kraków", kind: "dealer" },
    createdAt: "2026-10-11T12:30:00.000Z",
  },
  {
    id: "lst_camaro",
    title: "Chevrolet Camaro",
    make: "Chevrolet",
    model: "Camaro",
    year: 2019,
    price: 134500,
    currency: "PLN",
    mileageKm: 48000,
    fuel: "petrol",
    transmission: "manual",
    location: "Wrocław",
    description:
      "Механика, без чип-тюнинга. Два комплекта дисков. Продаю из-за переезда, готов показать на подъёмнике.",
    images: [
      photo("photo-1552519507-da3b142c6e3d", "center"),
      photo("photo-1552519507-da3b142c6e3d", "left"),
      photo("photo-1552519507-da3b142c6e3d", "right"),
    ],
    seller: { id: "seller_marek", name: "Marek", kind: "private" },
    createdAt: "2026-09-20T15:10:00.000Z",
  },
  {
    id: "lst_tesla",
    title: "Tesla Model 3",
    make: "Tesla",
    model: "Model 3",
    year: 2022,
    price: 149000,
    currency: "PLN",
    mileageKm: 36000,
    fuel: "electric",
    transmission: "automatic",
    location: "Poznań",
    description:
      "Long Range, батарея в норме, зарядка дома Type 2. Салон без прокуров и животных. Первый владелец.",
    images: [
      photo("photo-1560958089-b8a1929cea89", "center"),
      photo("photo-1560958089-b8a1929cea89", "top"),
      photo("photo-1560958089-b8a1929cea89", "bottom"),
      photo("photo-1560958089-b8a1929cea89", "left"),
    ],
    seller: { id: "seller_ola", name: "Ola", kind: "private" },
    createdAt: "2026-10-28T08:20:00.000Z",
  },
  {
    id: "lst_mercedes",
    title: "Mercedes-Benz",
    make: "Mercedes-Benz",
    model: "E-Class",
    year: 2017,
    price: 98000,
    currency: "PLN",
    mileageKm: 168000,
    fuel: "diesel",
    transmission: "automatic",
    location: "Gdańsk",
    description:
      "Дизель, автомат, комфортная комплектация. Менялись тормоза и масло в коробке. Небольшой пробег по трассе.",
    images: [
      photo("photo-1618843479313-40f8afb4b4d8", "center"),
      photo("photo-1618843479313-40f8afb4b4d8", "right"),
      photo("photo-1618843479313-40f8afb4b4d8", "top"),
    ],
    seller: { id: "seller_dealer_gdn", name: "Baltic Cars", kind: "dealer" },
    createdAt: "2026-08-14T11:00:00.000Z",
  },
  {
    id: "lst_audi",
    title: "Audi A5",
    make: "Audi",
    model: "A5",
    year: 2015,
    price: 74500,
    currency: "PLN",
    mileageKm: 189000,
    fuel: "diesel",
    transmission: "automatic",
    location: "Łódź",
    description:
      "Лифтбек, чёрный салон, круиз и камера. Есть мелкие сколы на капоте. Цена чуть ниже рынка, потому что продаю сам.",
    images: [
      photo("photo-1606664515524-ed2f786a0bd6", "center"),
      photo("photo-1606664515524-ed2f786a0bd6", "bottom"),
      photo("photo-1606664515524-ed2f786a0bd6", "left"),
    ],
    seller: { id: "seller_piotr", name: "Piotr", kind: "private" },
    createdAt: "2026-07-03T18:40:00.000Z",
  },
];

const PLACEHOLDER_GALLERIES = [
  SEED[0].images,
  SEED[1].images,
  SEED[3].images,
];

async function readCreated(): Promise<Listing[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Listing[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function persist(listings: Listing[]) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(listings, null, 2), "utf8");
}

export function listListings() {
  return locked(async () => {
    const created = await readCreated();
    return [...created].reverse().concat(SEED);
  });
}

export function getListing(id: string) {
  return locked(async () => {
    const created = await readCreated();
    return created.find((listing) => listing.id === id) ?? SEED.find((listing) => listing.id === id) ?? null;
  });
}

export function createListing(input: CreateListingInput, seller: PublicUser) {
  return locked(async () => {
    const created = await readCreated();
    const listing: Listing = {
      id: `lst_${crypto.randomUUID()}`,
      title: `${input.make} ${input.model}`,
      make: input.make,
      model: input.model,
      year: input.year,
      price: input.price,
      currency: "PLN",
      mileageKm: input.mileageKm,
      fuel: input.fuel,
      transmission: input.transmission,
      location: input.location,
      description: input.description,
      images: PLACEHOLDER_GALLERIES[created.length % PLACEHOLDER_GALLERIES.length],
      seller: { id: seller.id, name: seller.name, kind: "private" },
      createdAt: new Date().toISOString(),
    };
    created.push(listing);
    await persist(created);
    return listing;
  });
}
