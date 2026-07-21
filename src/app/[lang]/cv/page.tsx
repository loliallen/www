import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { nameFor, profile } from "@/content/profile";
import { getResume } from "@/content/resume";
import { PrintButton } from "@/components/PrintButton";
import { metadataFor } from "@/site/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const r = getResume(lang);
  return metadataFor("cv", lang, { title: "CV", description: r.summary });
}

export default async function CVPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const r = getResume(locale);
  const name = nameFor(locale);

  return (
    <article className="mx-auto my-8 max-w-3xl bg-white px-6 py-10 text-ink shadow-sm sm:px-10 print:my-0 print:max-w-none print:px-0 print:py-0 print:shadow-none">
      {/* Actions - screen only */}
      <div className="mb-8 flex items-center justify-between print:hidden">
        <Link
          href={`/${locale}`}
          className="font-mono text-xs uppercase tracking-widest text-ink/60 transition-colors hover:text-accent"
        >
          ← {r.labels.back}
        </Link>
        <PrintButton label={r.labels.print} />
      </div>

      {/* Header */}
      <header className="border-b-2 border-ink pb-5">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          {name}
        </h1>
        <p className="mt-2 font-mono text-sm uppercase tracking-widest text-accent">
          {r.title}
        </p>
        <div className="mt-3 h-1 w-20 bg-chartreuse" aria-hidden />
        <p className="mt-3 text-sm text-ink/70">{r.availability}</p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-ink/80">
          <li>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </li>
          {profile.links.map((l) => (
            <li key={l.label}>
              <a href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label}: {l.handle}
              </a>
            </li>
          ))}
        </ul>
      </header>

      {/* Summary */}
      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
          {r.labels.summary}
        </h2>
        <p className="mt-2 leading-relaxed text-ink/90">{r.summary}</p>
      </section>

      {/* Experience */}
      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
          {r.labels.experience}
        </h2>
        <div className="mt-4 space-y-7">
          {r.experience.map((role) => (
            <div key={role.company} className="break-inside-avoid">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="font-display text-lg font-bold tracking-tight">
                  {role.title}
                </h3>
                <span className="font-mono text-xs text-ink/60">
                  {role.period}
                </span>
              </div>
              <p className="font-mono text-xs uppercase tracking-wide text-accent">
                {role.company} · {role.location}
              </p>
              <p className="mt-1 text-sm italic text-ink/70">{role.context}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink/90 marker:text-accent">
                {role.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <p className="mt-2 font-mono text-xs text-ink/55">
                {r.labels.stack}: {role.stack}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
          {r.labels.skills}
        </h2>
        <dl className="mt-3 space-y-2">
          {r.skills.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-0.5 sm:flex-row sm:gap-3"
            >
              <dt className="font-mono text-xs uppercase tracking-wide text-ink/55 sm:w-48 sm:shrink-0">
                {s.label}
              </dt>
              <dd className="text-sm text-ink/90">{s.items}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
