/**
 * Single source of truth for locales. Add a language here, add its dictionary
 * (src/app/[lang]/dictionaries/<code>.json) and its translated MDX, and the
 * rest of the site picks it up - routing, metadata, the language switcher.
 */
export const LOCALES = ["en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Canonical site origin - used for metadata, sitemap, robots, JSON-LD. */
export const SITE_URL = "https://maxim.kasakin.tech";

/** Short label, native name + BCP-47 tag (used for <html lang> and hreflang). */
export const LOCALE_META: Record<
  Locale,
  { label: string; name: string; bcp47: string }
> = {
  en: { label: "EN", name: "English", bcp47: "en" },
  ru: { label: "RU", name: "Русский", bcp47: "ru" },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
