import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALE_META, SITE_URL, isLocale, type Locale } from "@/i18n/config";
import { posts, getPost } from "@/content/blog/posts";
import { getServiceLabels } from "@/content/services";
import { profile, nameFor } from "@/content/profile";
import { ContactDialog } from "@/components/ContactDialog";
import { metadataFor } from "@/site/metadata";

export const dynamicParams = false;

/**
 * Both segments are generated here, bottom up: a post exists in exactly one
 * language, so its locale travels with its slug. Returning only the slug lets
 * the parent's locales form a cross-product and publishes an English URL with
 * Russian content - and in Next 16 the documented top-down form (filtering the
 * parent's `params`) silently generated nothing at all.
 */
export function generateStaticParams() {
  return posts.map((p) => ({ lang: p.locale, slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const post = getPost(slug);
  if (!post || post.locale !== lang) return {};

  return metadataFor("blogPost", lang, {
    slug,
    title: post.metaTitle,
    description: post.metaDescription,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const post = getPost(slug);
  if (!post || post.locale !== locale) notFound();

  const t = getServiceLabels(locale);
  const Body = (await import(`@/content/blog/${slug}/${post.locale}.mdx`)).default;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle,
    description: post.metaDescription,
    inLanguage: LOCALE_META[locale].bcp47,
    datePublished: post.published,
    url: `${SITE_URL}/${locale}/blog/${slug}`,
    mainEntityOfPage: `${SITE_URL}/${locale}/blog/${slug}`,
    author: {
      "@type": "Person",
      name: nameFor(locale),
      url: SITE_URL,
      email: `mailto:${profile.email}`,
      sameAs: profile.links.map((l) => l.href),
    },
  };

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href={`/${locale}/blog`}
        className="font-mono text-sm uppercase tracking-widest text-ink/60 transition-colors hover:text-accent"
      >
        ← {post.backLabel}
      </Link>

      <header className="mt-8 border-b-2 border-ink pb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          {post.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-ink sm:text-6xl">
          {post.h1}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink/80">{post.lead}</p>

        <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden border-2 border-ink bg-ink sm:grid-cols-3">
          {post.facts.map((f) => (
            <div key={f.value} className="bg-paper p-4">
              <dt className="font-display text-2xl font-extrabold text-ink">
                {f.value}
              </dt>
              <dd className="mt-1 font-mono text-xs uppercase tracking-wide text-ink/60">
                {f.label}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-ink/50">
          <time dateTime={post.published}>
            {new Date(post.published).toLocaleDateString(
              LOCALE_META[locale].bcp47,
              { day: "numeric", month: "long", year: "numeric" },
            )}
          </time>
          {" · "}
          <a
            href={post.reference.href}
            target="_blank"
            rel="noopener"
            className="underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
          >
            {post.reference.label}
          </a>
        </p>
      </header>

      <Body />

      <section className="mt-16 border-2 border-ink bg-ink p-8 text-paper sm:p-10">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          {post.cta.title}
        </h2>
        <p className="mt-3 text-paper/80">{post.cta.body}</p>
        <ContactDialog
          labels={{
            trigger: post.cta.button,
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
