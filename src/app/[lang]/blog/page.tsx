import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALE_META, SITE_URL, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "../dictionaries";
import { posts } from "@/content/blog/posts";
import { nameFor, profile } from "@/content/profile";
import { metadataFor } from "@/site/metadata";
import { localesFor } from "@/site/routes";

export const dynamicParams = false;

/**
 * Only the languages the blog actually has posts in. An index listing nothing
 * is a thin page that competes with the rest of the site for no benefit.
 */
export function generateStaticParams() {
  return localesFor("blog").map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return metadataFor("blog", lang, {
    title: dict.blogPage.heading,
    description: dict.blogPage.lead,
    feed: `/${lang}/blog/feed.xml`,
  });
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  if (!localesFor("blog").includes(locale)) notFound();

  const dict = await getDictionary(locale);
  const t = dict.blogPage;
  const published = posts
    .filter((p) => p.locale === locale)
    .sort((a, b) => b.published.localeCompare(a.published));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: t.heading,
    description: t.lead,
    inLanguage: LOCALE_META[locale].bcp47,
    url: `${SITE_URL}/${locale}/blog`,
    author: {
      "@type": "Person",
      name: nameFor(locale),
      url: SITE_URL,
      sameAs: profile.links.map((l) => l.href),
    },
    blogPost: published.map((p) => ({
      "@type": "BlogPosting",
      headline: p.metaTitle,
      datePublished: p.published,
      url: `${SITE_URL}/${locale}/blog/${p.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        {t.eyebrow}
      </p>
      <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight text-ink sm:text-7xl">
        {t.heading}
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-ink/80">{t.lead}</p>

      {published.length === 0 ? (
        <p className="mt-16 text-lg text-ink/60">{t.empty}</p>
      ) : (
        <ol className="mt-16 space-y-px border-2 border-ink bg-ink">
          {published.map((p) => (
            <li key={p.slug} className="bg-paper">
              <Link
                href={`/${locale}/blog/${p.slug}`}
                className="group block p-6 transition-colors hover:bg-chartreuse/20 sm:p-8"
              >
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                  {p.eyebrow}
                </p>
                <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {p.h1}
                </h2>
                <p className="mt-3 max-w-2xl text-ink/80">{p.lead}</p>
                <p className="mt-4 flex flex-wrap items-center gap-x-3 font-mono text-xs uppercase tracking-widest text-ink/50">
                  <time dateTime={p.published}>
                    {new Date(p.published).toLocaleDateString(
                      LOCALE_META[locale].bcp47,
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </time>
                  <span
                    aria-hidden
                    className="text-ink underline decoration-accent decoration-2 underline-offset-4"
                  >
                    {t.readPost} →
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-10 font-mono text-xs uppercase tracking-widest text-ink/50">
        <a
          href={`/${locale}/blog/feed.xml`}
          className="underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
        >
          {t.feedLabel}
        </a>
      </p>
    </div>
  );
}
