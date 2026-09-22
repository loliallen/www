import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, LOCALE_META, SITE_URL } from "@/i18n/config";
import { indexableEntries, localesFor, pathFor } from "@/site/routes";

/**
 * Derived wholly from the route registry, so it cannot drift: a new route is
 * listed automatically, and a route marked `indexable: false` (like /cv) drops
 * out automatically - submitting a noindexed URL is a Search Console error.
 *
 * `changeFrequency` and `priority` are deliberately omitted: Google documents
 * that it ignores both.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return indexableEntries().map(({ key, locale, slug }) => {
    const available = localesFor(key, slug);
    const fallback = available.includes(DEFAULT_LOCALE)
      ? DEFAULT_LOCALE
      : available[0];

    return {
      url: `${SITE_URL}${pathFor(key, locale, slug)}`,
      lastModified,
      alternates: {
        languages: {
          ...Object.fromEntries(
            available.map((l) => [
              LOCALE_META[l].bcp47,
              `${SITE_URL}${pathFor(key, l, slug)}`,
            ]),
          ),
          "x-default": `${SITE_URL}${pathFor(key, fallback, slug)}`,
        },
      },
    };
  });
}
