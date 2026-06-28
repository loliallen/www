import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "./dictionaries";
import { projects } from "@/content/work/projects";
import { serviceSlugs, getServiceLabels } from "@/content/services";
import { ContactDialog } from "@/components/ContactDialog";

/** Locale-independent — these are technology names. */
const SKILLS = [
  "Go",
  "TypeScript",
  "Node.js",
  "NestJS",
  "Next.js",
  "React",
  "RabbitMQ",
  "BullMQ",
  "Redis",
  "gRPC",
  "MongoDB",
  "SQL",
  "Docker",
  "Kubernetes",
  "CI/CD",
];

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const serviceLabels = getServiceLabels(locale);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="overflow-hidden border-b-2 border-ink">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent sm:text-sm">
            {dict.hero.eyebrow}
          </p>
          <h1 className="mt-6 font-display font-extrabold leading-[0.85] tracking-tight text-ink text-[clamp(3rem,13vw,11rem)]">
            <span className="block">{dict.hero.lineOne}</span>
            <span className="block">{dict.hero.lineTwo}</span>
            <span className="mt-1 inline-block bg-chartreuse px-3 text-ink [box-decoration-break:clone]">
              {dict.hero.lineThree}
            </span>
          </h1>
          <div className="mt-12 grid items-end gap-8 md:grid-cols-[1fr_auto]">
            <p className="max-w-xl text-lg leading-relaxed text-ink/80">
              {dict.hero.intro}
            </p>
            <a
              href={`/${locale}#work`}
              className="group inline-flex items-center justify-center gap-3 border-2 border-ink bg-ink px-7 py-4 font-mono text-sm uppercase tracking-widest text-paper transition-colors hover:bg-chartreuse hover:text-ink"
            >
              {dict.hero.cta}
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Metrics band (signature) ─────────────────────────────────── */}
      <section className="border-b-2 border-ink bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/50">
            {dict.metrics.label}
          </p>
          <dl className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
            {dict.metrics.items.map((m) => (
              <div key={m.value} className="min-w-0 border-l-2 border-chartreuse/40 pl-5">
                <dt className="whitespace-nowrap font-display font-extrabold leading-none tracking-tight text-chartreuse text-[clamp(2rem,4vw,3rem)]">
                  {m.value}
                </dt>
                <dd className="mt-3 max-w-[22ch] text-sm leading-snug text-paper/70">
                  {m.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Work ─────────────────────────────────────────────────────── */}
      <section id="work" className="scroll-mt-20 border-b-2 border-ink">
        <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {dict.work.label}
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">
            {dict.work.heading}
          </h2>
        </div>

        <ul className="mx-auto mt-12 max-w-6xl border-t-2 border-ink">
          {projects.map((project, i) => (
            <li key={project.slug}>
              <Link
                href={`/${locale}/work/${project.slug}`}
                className="group grid gap-4 border-b-2 border-ink px-5 py-8 transition-colors hover:bg-chartreuse sm:grid-cols-[auto_1fr_auto] sm:items-baseline sm:gap-8 sm:px-8"
              >
                <span className="font-mono text-sm text-ink/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {project.title[locale]}
                  </h3>
                  <p className="mt-1 font-mono text-xs uppercase tracking-widest text-ink/60">
                    {project.role[locale]} · {project.company[locale]} ·{" "}
                    {project.year}
                  </p>
                  <p className="mt-3 max-w-2xl text-ink/80">
                    {project.summary[locale]}
                  </p>
                </div>
                <span className="hidden font-mono text-sm uppercase tracking-widest text-ink/60 group-hover:text-ink sm:block">
                  {dict.work.viewProject} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── About ────────────────────────────────────────────────────── */}
      <section
        id="about"
        className="scroll-mt-20 border-b-2 border-ink bg-plum text-paper"
      >
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-chartreuse">
            {dict.about.label}
          </p>
          <div className="mt-6 grid gap-10 md:grid-cols-[1fr_1.4fr]">
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {dict.about.heading}
            </h2>
            <div>
              <p className="text-lg leading-relaxed text-paper/90">
                {dict.about.body}
              </p>
              <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-paper/50">
                {dict.about.skillsLabel}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <li
                    key={skill}
                    className="border border-paper/30 px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-paper/80"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services (secondary — "also available for") ──────────────── */}
      <section id="services" className="scroll-mt-20 border-b-2 border-ink">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {dict.services.label}
          </p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {dict.services.heading}
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-ink/80">
            {dict.services.intro}
          </p>

          <ul className="mt-12 grid gap-px border-2 border-ink bg-ink sm:grid-cols-3">
            {dict.services.items.map((s, i) => (
              <li key={s.title}>
                <Link
                  href={`/${locale}/services/${serviceSlugs[i]}`}
                  className="group flex h-full flex-col bg-paper p-6 transition-colors hover:bg-chartreuse"
                >
                  <span className="font-mono text-sm text-ink/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold tracking-tight text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-3 flex-1 text-ink/80">{s.body}</p>
                  <p className="mt-5 font-mono text-xs uppercase tracking-wide text-accent">
                    {s.tag}
                  </p>
                  <span className="mt-4 font-mono text-xs uppercase tracking-widest text-ink/60 group-hover:text-ink">
                    {serviceLabels.learnMore} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <section id="contact" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {dict.contact.label}
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">
            {dict.contact.heading}
          </h2>
          <p className="mt-5 max-w-xl text-lg text-ink/80">
            {dict.contact.body}
          </p>

          {/* Single contact entry point — the dialog lists every channel
              (Telegram first as fastest), so no redundant inline list. */}
          <ContactDialog
            labels={{
              trigger: serviceLabels.ctaButton,
              title: serviceLabels.contactTitle,
              subtitle: serviceLabels.contactSubtitle,
              close: serviceLabels.contactClose,
              emailLabel: serviceLabels.emailLabel,
              fastestLabel: serviceLabels.fastestLabel,
            }}
          />
        </div>
      </section>
    </>
  );
}
