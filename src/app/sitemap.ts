import type { MetadataRoute } from "next";
import { LOCALES, LOCALE_META, SITE_URL } from "@/i18n/config";
import { projects } from "@/content/work/projects";
import { serviceSlugs } from "@/content/services";

/** Build hreflang alternates for a per-locale path template, e.g. `/{l}/services`. */
function alternates(pathFor: (l: string) => string) {
  return {
    languages: Object.fromEntries(
      LOCALES.map((l) => [LOCALE_META[l].bcp47, `${SITE_URL}${pathFor(l)}`]),
    ),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Static per-locale paths.
  const staticPaths = ["", "/services", "/cv"];
  for (const p of staticPaths) {
    for (const l of LOCALES) {
      entries.push({
        url: `${SITE_URL}/${l}${p}`,
        changeFrequency: "monthly",
        priority: p === "" ? 1 : 0.7,
        alternates: alternates((loc) => `/${loc}${p}`),
      });
    }
  }

  // Work case studies.
  for (const project of projects) {
    for (const l of LOCALES) {
      entries.push({
        url: `${SITE_URL}/${l}/experience/${project.slug}`,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: alternates((loc) => `/${loc}/experience/${project.slug}`),
      });
    }
  }

  // Service pages.
  for (const slug of serviceSlugs) {
    for (const l of LOCALES) {
      entries.push({
        url: `${SITE_URL}/${l}/services/${slug}`,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: alternates((loc) => `/${loc}/services/${slug}`),
      });
    }
  }

  return entries;
}
