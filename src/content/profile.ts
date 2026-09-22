import type { Locale } from "@/i18n/config";

/**
 * Identity + contact links. Single source of truth - used by the wordmark,
 * contact section, footer, and metadata. Locale-independent values (handles,
 * URLs) live here; translated copy lives in the dictionaries.
 */
export const profile = {
  name: {
    en: "Maxim Kasakin",
    ru: "Максим Касакин",
  } satisfies Record<Locale, string>,
  email: "maxim.kasakin@yahoo.com",
  /**
   * Separate inbox for game-server work, used by the blog and the posts in it.
   * Those enquiries arrive from a different audience than hiring does, and
   * keeping them apart means neither gets buried in the other.
   */
  gameServerEmail: "dayz@kasakin.tech",
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
    {
      label: "Discord",
      // A direct-message link needs the numeric user id; the username alone
      // does not resolve to a URL.
      href: "https://discord.com/users/320536108008210433",
      handle: "17",
      fastest: false,
    },
  ],
} as const;

export function nameFor(locale: Locale): string {
  return profile.name[locale];
}
