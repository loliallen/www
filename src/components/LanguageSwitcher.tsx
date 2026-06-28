"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/config";

/** Swaps the leading /<locale> segment, preserving the rest of the path. */
function pathForLocale(pathname: string, locale: Locale): string {
  const segments = pathname.split("/");
  // segments[0] is "" (leading slash); segments[1] is the current locale.
  segments[1] = locale;
  return segments.join("/") || `/${locale}`;
}

export function LanguageSwitcher({
  current,
  switchLabel,
}: {
  current: Locale;
  switchLabel: string;
}) {
  const pathname = usePathname() ?? `/${current}`;

  return (
    <nav aria-label={switchLabel} className="flex items-center gap-1">
      {LOCALES.map((locale) => {
        const isActive = locale === current;
        return (
          <Link
            key={locale}
            href={pathForLocale(pathname, locale)}
            hrefLang={LOCALE_META[locale].bcp47}
            aria-current={isActive ? "true" : undefined}
            className={[
              "px-2 py-1 font-mono text-sm uppercase tracking-widest transition-colors",
              isActive
                ? "text-ink underline decoration-chartreuse decoration-2 underline-offset-4"
                : "text-ink/40 hover:text-ink",
            ].join(" ")}
          >
            {LOCALE_META[locale].label}
          </Link>
        );
      })}
    </nav>
  );
}
