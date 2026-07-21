import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "../dictionaries";
import { getResume } from "@/content/resume";
import { metadataFor } from "@/site/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return metadataFor("experience", lang, {
    title: dict.experiencePage.eyebrow,
    description: dict.experiencePage.lead,
  });
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const r = getResume(locale);
  const t = dict.experiencePage;

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        {t.eyebrow}
      </p>
      <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight text-ink sm:text-7xl">
        {t.heading}
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-ink/80">{t.lead}</p>

      <ol className="mt-16 space-y-14">
        {r.experience.map((role) => (
          <li key={role.company} className="border-t-2 border-ink pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {role.title}
              </h2>
              <span className="font-mono text-xs uppercase tracking-widest text-ink/60">
                {role.period}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-accent">
              {role.company} · {role.location}
            </p>
            <p className="mt-3 italic text-ink/70">{role.context}</p>

            <ul className="mt-4 list-disc space-y-1.5 pl-5 leading-relaxed text-ink/90 marker:text-accent">
              {role.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            <p className="mt-4 font-mono text-xs text-ink/55">
              {r.labels.stack}: {role.stack}
            </p>

            {role.caseStudySlug && (
              <Link
                href={`/${locale}/experience/${role.caseStudySlug}`}
                className="mt-5 inline-block font-mono text-sm font-medium text-ink underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
              >
                {t.caseStudy} →
              </Link>
            )}
          </li>
        ))}
      </ol>

      <p className="mt-16 border-t-2 border-ink pt-8">
        <Link
          href={`/${locale}/cv`}
          className="font-mono text-sm uppercase tracking-widest text-ink/60 transition-colors hover:text-accent"
        >
          {t.cvCta} →
        </Link>
      </p>
    </div>
  );
}
