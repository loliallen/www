import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { nameFor } from "@/content/profile";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function SiteHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const base = `/${locale}`;
  const navItems = [
    { href: `${base}#work`, label: dict.nav.work },
    { href: `${base}#about`, label: dict.nav.about },
    { href: `${base}#contact`, label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
        <Link
          href={base}
          className="font-display text-lg font-extrabold tracking-tight text-ink"
        >
          {nameFor(locale)}
        </Link>

        <div className="flex items-center gap-4 sm:gap-8">
          <nav
            aria-label="Primary"
            className="hidden items-center gap-6 sm:flex"
          >
            {navItems.map((item) => (
              // Native anchor (not next/link) so same-page section jumps use
              // the CSS `scroll-behavior: smooth` instead of an instant push.
              <a
                key={item.href}
                href={item.href}
                className="font-mono text-sm uppercase tracking-widest text-ink/70 transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Link
            href={`${base}/experience`}
            className="hidden font-mono text-sm uppercase tracking-widest text-ink/70 transition-colors hover:text-ink sm:block"
          >
            {dict.nav.experience}
          </Link>
          <Link
            href={`${base}/cv`}
            className="inline-flex items-center gap-1.5 border-2 border-ink bg-ink px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-paper transition-colors hover:bg-chartreuse hover:text-ink"
          >
            {dict.nav.cv}
            <span aria-hidden>→</span>
          </Link>
          <LanguageSwitcher
            current={locale}
            switchLabel={dict.language.switchTo}
          />
        </div>
      </div>
    </header>
  );
}
