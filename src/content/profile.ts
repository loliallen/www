import type { Locale } from "@/i18n/config";

/**
 * Identity + contact links. Single source of truth — used by the wordmark,
 * contact section, footer, and metadata. Locale-independent values (handles,
 * URLs) live here; translated copy lives in the dictionaries.
 */
export const profile = {
  name: {
    en: "Maxim Kasakin",
    ru: "Максим Касакин",
  } satisfies Record<Locale, string>,
  email: "maxim.kasakin@yahoo.com",
  links: [
    {
      label: "GitHub",
      href: "https://github.com/loliallen",
      handle: "loliallen",
      fastest: false,
    },
    {
      label: "Telegram",
      href: "https://t.me/loliallen",
      handle: "@loliallen",
      fastest: true,
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/maxim-kasakin",
      handle: "maxim-kasakin",
      fastest: false,
    },
  ],
} as const;

export function nameFor(locale: Locale): string {
  return profile.name[locale];
}
