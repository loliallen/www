import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getServices, getServiceLabels } from "@/content/services";
import { metadataFor } from "@/site/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getServiceLabels(lang);
  const title =
    lang === "en"
      ? "Services - Backend, AI & Web3 Engineering"
      : "Услуги - бэкенд, AI и Web3";
  return metadataFor("services", lang, { title, description: t.indexLead });
}

export default async function ServicesIndex({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const services = getServices(locale);
  const t = getServiceLabels(locale);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        {t.indexEyebrow}
      </p>
      <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight text-ink sm:text-7xl">
        {t.indexTitle}
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-ink/80">{t.indexLead}</p>

      <ul className="mt-12 grid gap-px border-2 border-ink bg-ink md:grid-cols-3">
        {services.map((s, i) => (
          <li key={s.slug}>
            <Link
              href={`/${locale}/services/${s.slug}`}
              className="group flex h-full flex-col bg-paper p-6 transition-colors hover:bg-chartreuse"
            >
              <span className="font-mono text-sm text-ink/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-ink">
                {s.h1}
              </h2>
              <p className="mt-3 flex-1 text-ink/80">{s.tagline}</p>
              <span className="mt-5 font-mono text-xs uppercase tracking-widest text-ink/60 group-hover:text-ink">
                {t.learnMore} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
