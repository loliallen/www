import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { nameFor, profile } from "@/content/profile";

export function SiteFooter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <footer className="border-t-2 border-ink bg-ink text-paper print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <p className="font-display text-2xl font-extrabold tracking-tight">
            {nameFor(locale)}
          </p>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-paper/50">
            {dict.footer.builtWith}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {profile.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-paper/70 underline decoration-chartreuse decoration-2 underline-offset-4 transition-colors hover:text-chartreuse"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
