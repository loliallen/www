import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LOCALES,
  LOCALE_META,
  SITE_URL,
  isLocale,
  type Locale,
} from "@/i18n/config";
import {
  serviceSlugs,
  getService,
  getServiceLabels,
} from "@/content/services";
import { profile, nameFor } from "@/content/profile";
import { ContactDialog } from "@/components/ContactDialog";
import { metadataFor } from "@/site/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const service = getService(lang, slug);
  if (!service) return {};

  return metadataFor("serviceItem", lang, {
    slug,
    title: service.metaTitle,
    description: service.metaDescription,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const service = getService(locale, slug);
  if (!service) notFound();
  const t = getServiceLabels(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.h1,
    serviceType: service.serviceType,
    description: service.metaDescription,
    url: `${SITE_URL}/${locale}/services/${slug}`,
    areaServed: "Worldwide",
    availableLanguage: LOCALES.map((l) => LOCALE_META[l].bcp47),
    provider: {
      "@type": "Person",
      name: nameFor(locale),
      url: SITE_URL,
      jobTitle: "Staff Software Engineer",
      email: `mailto:${profile.email}`,
      sameAs: profile.links.map((l) => l.href),
    },
  };

  return (
    <article className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href={`/${locale}/services`}
        className="font-mono text-sm uppercase tracking-widest text-ink/60 transition-colors hover:text-accent"
      >
        ← {t.backToServices}
      </Link>

      <header className="mt-8 border-b-2 border-ink pb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          {t.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-ink sm:text-6xl">
          {service.h1}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink/80">{service.tagline}</p>
      </header>

      <p className="mt-10 max-w-3xl text-lg leading-relaxed text-ink/80">
        {service.intro}
      </p>

      {/* Offerings */}
      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
          {t.offeringsTitle}
        </h2>
        <ul className="mt-6 grid gap-px border-2 border-ink bg-ink sm:grid-cols-2">
          {service.offerings.map((o) => (
            <li key={o.title} className="bg-paper p-6">
              <h3 className="font-display text-lg font-bold tracking-tight text-ink">
                {o.title}
              </h3>
              <p className="mt-2 text-ink/80">{o.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Proof */}
      <section className="mt-14 border-l-4 border-chartreuse bg-plum/[0.04] py-6 pl-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          {t.proofTitle}
        </h2>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink/90">
          {service.proof}
        </p>
        <Link
          href={`/${locale}/experience/${service.proofLink.slug}`}
          className="mt-4 inline-block font-mono text-sm font-medium text-ink underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
        >
          {service.proofLink.label} →
        </Link>
      </section>

      {/* Stack */}
      <section className="mt-14">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
          {t.stackTitle}
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {service.stack.map((tech) => (
            <li
              key={tech}
              className="border border-ink/20 px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-ink/70"
            >
              {tech}
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="mt-16 border-2 border-ink bg-ink p-8 text-paper sm:p-10">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          {t.ctaTitle}
        </h2>
        <p className="mt-3 max-w-xl text-paper/80">{t.ctaBody}</p>
        <ContactDialog
          labels={{
            trigger: t.ctaButton,
            title: t.contactTitle,
            subtitle: t.contactSubtitle,
            close: t.contactClose,
            emailLabel: t.emailLabel,
            fastestLabel: t.fastestLabel,
          }}
        />
      </section>
    </article>
  );
}
