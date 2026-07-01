import "server-only";
import type { Locale } from "@/i18n/config";
import type en from "./dictionaries/en.json";

/** The dictionary shape is inferred from the English file - the canonical one. */
export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  ru: () => import("./dictionaries/ru.json").then((m) => m.default),
};

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
