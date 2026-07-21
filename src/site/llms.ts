import { DEFAULT_LOCALE, SITE_URL } from "@/i18n/config";
import { nameFor, profile } from "@/content/profile";
import { getResume } from "@/content/resume";
import { projects } from "@/content/work/projects";
import { getServices } from "@/content/services";
import { pathFor } from "./routes";

const L = DEFAULT_LOCALE;

/** https://llmstxt.org - a curated Markdown index of the site for LLM agents. */
export function renderLlmsTxt(): string {
  const r = getResume(L);
  const url = (path: string) => `${SITE_URL}${path}`;

  const lines: string[] = [
    `# ${nameFor(L)}`,
    "",
    `> ${r.title}. ${r.summary}`,
    "",
    `Site: ${SITE_URL}`,
    "",
    "## Experience",
    "",
    `- [All roles and case studies](${url(pathFor("experience", L))}): ${r.experience
      .map((e) => `${e.title} at ${e.company} (${e.period})`)
      .join("; ")}`,
    "",
    "## Case studies",
    "",
    ...projects.map(
      (p) =>
        `- [${p.title[L]}](${url(pathFor("experienceItem", L, p.slug))}): ${p.summary[L]}`,
    ),
    "",
    "## Services",
    "",
    ...getServices(L).map(
      (s) => `- [${s.h1}](${url(pathFor("serviceItem", L, s.slug))}): ${s.tagline}`,
    ),
    "",
    "## Contact",
    "",
    `- Email: ${profile.email}`,
    ...profile.links.map((l) => `- ${l.label}: ${l.href}`),
    "",
  ];

  return lines.join("\n");
}
