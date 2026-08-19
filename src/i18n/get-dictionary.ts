import "server-only";
import type { Locale } from "./config";
import uz from "./dictionaries/uz.json";

export type Dictionary = typeof uz;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  uz: () => Promise.resolve(uz),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  ru: () => import("./dictionaries/ru.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
