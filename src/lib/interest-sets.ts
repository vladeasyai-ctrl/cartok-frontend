import type { InterestProfile, InterestSetPick, PreferenceChoice, Preferences } from "@/lib/types";
import { MAX_INTEREST_SETS } from "@/lib/types";

/** make — подпись марки otomoto. Нет make — лист виден в опросе и в предпочтения не пишется. model "" — вся марка. */
export type InterestModel = { id: string; label: string; make?: string; model?: string };

export type InterestSet = {
  id: string;
  title: string;
  icon: string;
  models: InterestModel[];
};

export const INTEREST_STEPS = [
  {
    key: "often",
    title: "Что бы вы хотели видеть чаще всего?",
    lead: "До трёх наборов. Модели выбранных — ниже, лишнее можно снять.",
  },
  {
    key: "rarely",
    title: "Что бы вы хотели видеть реже?",
    lead: "Те же наборы, без уже выбранных. Тоже не больше трёх.",
  },
  {
    key: "also",
    title: "Чем ещё вы могли бы интересоваться?",
    lead: "Снова до трёх наборов и без тех, что выбрали раньше.",
  },
] as const;

export type InterestStepKey = (typeof INTEREST_STEPS)[number]["key"];

/** Пресеты опроса. В каталоге объявлений этих моделей может ещё не быть — это только выбор интереса. */
export const INTEREST_SETS: InterestSet[] = [
  {
    id: "muscle",
    title: "American Muscle",
    icon: "🏁",
    models: [
      { id: "muscle.mustang", label: "Mustang", make: "Ford", model: "Mustang" },
      { id: "muscle.challenger", label: "Challenger", make: "Dodge", model: "Challenger" },
      { id: "muscle.camaro", label: "Camaro", make: "Chevrolet", model: "Camaro" },
      { id: "muscle.charger", label: "Charger", make: "Dodge", model: "Charger" },
    ],
  },
  {
    id: "german",
    title: "German Performance",
    icon: "🇩🇪",
    models: [
      { id: "german.m4", label: "BMW M4", make: "BMW", model: "M4" },
      { id: "german.c63", label: "Mercedes-AMG C63" },
      { id: "german.rs5", label: "Audi RS5", make: "Audi", model: "RS5" },
      { id: "german.911", label: "Porsche 911", make: "Porsche", model: "911" },
    ],
  },
  {
    id: "jdm",
    title: "JDM",
    icon: "🇯🇵",
    models: [
      { id: "jdm.supra", label: "Toyota Supra", make: "Toyota", model: "Supra" },
      { id: "jdm.gtr", label: "Nissan GT-R", make: "Nissan", model: "GT-R" },
      { id: "jdm.rx7", label: "Mazda RX-7", make: "Mazda", model: "RX-7" },
      { id: "jdm.skyline", label: "Nissan Skyline", make: "Nissan", model: "Skyline" },
    ],
  },
  {
    id: "supercars",
    title: "European Supercars",
    icon: "🏎️",
    models: [
      { id: "supercars.ferrari", label: "Ferrari", make: "Ferrari", model: "" },
      { id: "supercars.lamborghini", label: "Lamborghini", make: "Lamborghini", model: "" },
      { id: "supercars.mclaren", label: "McLaren", make: "McLaren", model: "" },
      { id: "supercars.porsche", label: "Porsche", make: "Porsche", model: "" },
    ],
  },
  {
    id: "tuner",
    title: "Street / Tuner",
    icon: "🔥",
    models: [
      { id: "tuner.civic", label: "Honda Civic Type R" },
      { id: "tuner.wrx", label: "Subaru WRX STI" },
      { id: "tuner.evo", label: "Mitsubishi Lancer Evo" },
      { id: "tuner.golf-r", label: "VW Golf R" },
    ],
  },
  {
    id: "luxury-suv",
    title: "Luxury SUV",
    icon: "🛻",
    models: [
      { id: "luxury.g-class", label: "Mercedes G-Class" },
      { id: "luxury.range-rover", label: "Range Rover" },
      { id: "luxury.cayenne", label: "Porsche Cayenne", make: "Porsche", model: "Cayenne" },
      { id: "luxury.x5", label: "BMW X5", make: "BMW", model: "X5" },
    ],
  },
  {
    id: "offroad",
    title: "Off-road",
    icon: "🏔️",
    models: [
      { id: "offroad.wrangler", label: "Jeep Wrangler", make: "Jeep", model: "Wrangler" },
      { id: "offroad.land-cruiser", label: "Toyota Land Cruiser" },
      { id: "offroad.defender", label: "Land Rover Defender", make: "Land Rover", model: "Defender" },
      { id: "offroad.bronco", label: "Ford Bronco", make: "Ford", model: "Bronco" },
    ],
  },
  {
    id: "classic",
    title: "Classic Cars",
    icon: "🕰️",
    models: [
      { id: "classic.mustang-1969", label: "Ford Mustang 1969" },
      { id: "classic.911", label: "Porsche 911 Classic" },
      { id: "classic.e30", label: "BMW E30" },
      { id: "classic.w123", label: "Mercedes W123" },
    ],
  },
  {
    id: "cruiser",
    title: "Cruiser / Classic Motorcycles",
    icon: "🏍️",
    models: [
      { id: "cruiser.harley", label: "Harley-Davidson" },
      { id: "cruiser.indian", label: "Indian" },
      { id: "cruiser.bonneville", label: "Triumph Bonneville" },
      { id: "cruiser.ninet", label: "BMW R nineT" },
    ],
  },
  {
    id: "sport-moto",
    title: "Sport Motorcycles",
    icon: "🏍️",
    models: [
      { id: "sport-moto.panigale", label: "Ducati Panigale" },
      { id: "sport-moto.r1", label: "Yamaha R1" },
      { id: "sport-moto.ninja", label: "Kawasaki Ninja" },
      { id: "sport-moto.s1000rr", label: "BMW S1000RR" },
    ],
  },
  {
    id: "electric",
    title: "Electric Performance",
    icon: "⚡",
    models: [
      { id: "electric.plaid", label: "Tesla Model S Plaid" },
      { id: "electric.taycan", label: "Porsche Taycan", make: "Porsche", model: "Taycan" },
      { id: "electric.ioniq", label: "Hyundai Ioniq 5 N" },
      { id: "electric.i4", label: "BMW i4 M50" },
      { id: "electric.nevera", label: "Rimac Nevera", make: "Rimac", model: "Nevera" },
    ],
  },
];

export function emptyInterestProfile(): InterestProfile {
  return { often: [], rarely: [], also: [] };
}

export function findInterestSet(setId: string) {
  return INTEREST_SETS.find((item) => item.id === setId) ?? null;
}

export function setLeafIds(set: InterestSet) {
  return set.models.map((model) => model.id);
}

/** Набор, уже стоящий в другом вопросе, на этом шаге не показываем. */
export function takenElsewhere(profile: InterestProfile, step: InterestStepKey) {
  const keys: InterestStepKey[] = ["often", "rarely", "also"];
  return keys.filter((key) => key !== step).flatMap((key) => profile[key].map((pick) => pick.setId));
}

function withoutSet(list: InterestSetPick[], setId: string) {
  return list.filter((pick) => pick.setId !== setId);
}

/** Набор может стоять только в одном вопросе. */
export function selectInterestSet(profile: InterestProfile, step: InterestStepKey, setId: string): InterestProfile {
  const cleared: InterestProfile = {
    often: withoutSet(profile.often, setId),
    rarely: withoutSet(profile.rarely, setId),
    also: withoutSet(profile.also, setId),
  };
  if (cleared[step].length >= MAX_INTEREST_SETS) return profile;
  return { ...cleared, [step]: [...cleared[step], { setId, unchecked: [] }] };
}

export function deselectInterestSet(profile: InterestProfile, step: InterestStepKey, setId: string): InterestProfile {
  return { ...profile, [step]: withoutSet(profile[step], setId) };
}

/** turnOn включает переданные модели, иначе снимает. Пустой набор с шага уходит. */
export function toggleInterestLeaves(
  profile: InterestProfile,
  step: InterestStepKey,
  setId: string,
  leafIds: string[],
  turnOn: boolean,
): InterestProfile {
  const set = findInterestSet(setId);
  const pick = profile[step].find((item) => item.setId === setId);
  if (!set || !pick) return profile;
  const off = new Set(pick.unchecked);
  for (const id of leafIds) {
    if (turnOn) off.delete(id);
    else off.add(id);
  }
  const leaves = setLeafIds(set);
  const unchecked = leaves.filter((id) => off.has(id));
  if (unchecked.length >= leaves.length) return deselectInterestSet(profile, step, setId);
  return {
    ...profile,
    [step]: profile[step].map((item) => (item.setId === setId ? { setId, unchecked } : item)),
  };
}

/** often / rarely / also → приоритеты 1–3. Лист без марки пропускается, повтор марки и модели остаётся в первом приоритете. */
export function preferencesFromInterest(profile: InterestProfile): Preferences {
  const seen = new Set<string>();
  const priorities = INTEREST_STEPS.map((step) => {
    const choices: PreferenceChoice[] = [];
    for (const pick of profile[step.key] ?? []) {
      const set = findInterestSet(pick.setId);
      if (!set) continue;
      const off = new Set(pick.unchecked);
      for (const leaf of set.models) {
        if (!leaf.make || off.has(leaf.id)) continue;
        const model = leaf.model ?? "";
        const key = `${leaf.make.toLowerCase()}\n${model.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        choices.push({ make: leaf.make, model });
      }
    }
    return choices;
  });
  return {
    priorities,
    fuels: [],
    yearFrom: null,
    yearTo: null,
    mileageFrom: null,
    mileageTo: null,
  };
}

export function sanitizeInterestProfile(profile: InterestProfile): InterestProfile {
  const used = new Set<string>();
  function clean(list: InterestSetPick[] | undefined): InterestSetPick[] {
    const next: InterestSetPick[] = [];
    if (!Array.isArray(list)) return next;
    for (const pick of list) {
      if (!pick || typeof pick.setId !== "string" || used.has(pick.setId) || next.length >= MAX_INTEREST_SETS) continue;
      const set = findInterestSet(pick.setId);
      if (!set) continue;
      const known = new Set(setLeafIds(set));
      const unchecked = Array.isArray(pick.unchecked)
        ? pick.unchecked.filter((id) => typeof id === "string" && known.has(id))
        : [];
      if (unchecked.length >= known.size) continue;
      used.add(pick.setId);
      next.push({ setId: pick.setId, unchecked });
    }
    return next;
  }
  return {
    often: clean(profile.often),
    rarely: clean(profile.rarely),
    also: clean(profile.also),
  };
}
