"use client";

import { useEffect, useRef, useState } from "react";
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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={switchLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-1.5 py-1 font-mono text-sm uppercase tracking-widest text-ink/70 transition-colors hover:text-ink"
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <path d="M12 3a14 14 0 0 1 3.6 9 14 14 0 0 1-3.6 9 14 14 0 0 1-3.6-9A14 14 0 0 1 12 3z" />
        </svg>
        <span>{LOCALE_META[current].label}</span>
      </button>

      {open && (
        <ul
          role="menu"
          aria-label={switchLabel}
          className="absolute right-0 top-full z-50 mt-2 min-w-[8.5rem] border-2 border-ink bg-paper py-1 shadow-[4px_4px_0_0_var(--color-ink)]"
        >
          {LOCALES.map((locale) => {
            const isActive = locale === current;
            return (
              <li key={locale} role="none">
                <Link
                  role="menuitem"
                  href={pathForLocale(pathname, locale)}
                  hrefLang={LOCALE_META[locale].bcp47}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center justify-between gap-3 px-3 py-2 transition-colors hover:bg-chartreuse",
                    isActive ? "text-ink" : "text-ink/60",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "text-sm",
                      isActive
                        ? "underline decoration-chartreuse decoration-2 underline-offset-4"
                        : "",
                    ].join(" ")}
                  >
                    {LOCALE_META[locale].name}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-ink/40">
                    {LOCALE_META[locale].label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
