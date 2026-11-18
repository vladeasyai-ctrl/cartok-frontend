/**
 * Марки и модели для экрана предпочтений. Названия — ровно как в объявлениях otomoto,
 * иначе предпочтение не совпадёт ни с одним объявлением (сравнение без учёта регистра).
 */
export const CATALOG: { make: string; models: string[] }[] = [
  { make: "Audi", models: ["A3", "A4", "A6", "Q5", "Q7"] },
  { make: "BMW", models: ["Seria 1", "Seria 3", "Seria 5", "X3", "X5"] },
  { make: "Chevrolet", models: ["Camaro", "Corvette"] },
  { make: "Dodge", models: ["Challenger", "Charger", "Durango", "RAM"] },
  { make: "Ford", models: ["Focus", "Kuga", "Mondeo", "Mustang"] },
  { make: "Hyundai", models: ["i30", "Santa Fe", "Tucson"] },
  { make: "Kia", models: ["Ceed", "Sorento", "Sportage"] },
  { make: "Mercedes-Benz", models: ["Klasa A", "Klasa C", "Klasa E", "GLC"] },
  { make: "Porsche", models: ["911", "Cayenne", "Macan"] },
  { make: "Skoda", models: ["Fabia", "Kodiaq", "Octavia", "Superb"] },
  { make: "Tesla", models: ["Model 3", "Model S", "Model Y"] },
  { make: "Toyota", models: ["Camry", "Corolla", "RAV4", "Yaris"] },
  { make: "Volkswagen", models: ["Golf", "Passat", "Polo", "Tiguan"] },
];
