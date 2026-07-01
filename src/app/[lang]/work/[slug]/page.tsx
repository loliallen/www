import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "../../dictionaries";
import { projects, getProject } from "@/content/work/projects";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

/** Load the case-study body for a locale, falling back to English if the
 *  translation doesn't exist yet - so a missing RU file never 404s. */
async function loadBody(slug: string, locale: Locale) {
  try {
    return (await import(`@/content/work/${slug}/${locale}.mdx`)).default;
  } catch {
    return (await import(`@/content/work/${slug}/en.mdx`)).default;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title[lang]} - ${project.role[lang]}`,
    description: project.summary[lang],
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const project = getProject(slug);
  if (!project) notFound();

  const dict = await getDictionary(locale);
  const Body = await loadBody(slug, locale);

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <Link
        href={`/${locale}#work`}
        className="font-mono text-sm uppercase tracking-widest text-ink/60 transition-colors hover:text-accent"
      >
        ← {dict.work.backToWork}
      </Link>

      <header className="mt-8 border-b-2 border-ink pb-10">
        <p className="font-mono text-sm uppercase tracking-widest text-accent">
          {project.company[locale]} · {project.location[locale]} · {project.year}
        </p>
        <h1 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-ink sm:text-6xl">
          {project.title[locale]}
        </h1>
        <p className="mt-4 font-mono text-sm uppercase tracking-widest text-ink/70">
          {dict.work.roleLabel}: {project.role[locale]}
        </p>

        {/* Metric strip - the signature device, repeated per project. */}
        <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden border-2 border-ink bg-ink sm:grid-cols-3">
          {project.metrics.map((m) => (
            <div key={m.value} className="bg-paper p-4">
              <dt className="font-display text-2xl font-extrabold text-ink">
                {m.value}
              </dt>
              <dd className="mt-1 font-mono text-xs uppercase tracking-wide text-ink/60">
                {m.label[locale]}
              </dd>
            </div>
          ))}
        </dl>

        <ul className="mt-6 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="border border-ink/20 px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-ink/70"
            >
              {tech}
            </li>
          ))}
        </ul>
      </header>

      <div className="mt-10">
        <Body />
      </div>
    </article>
  );
}
