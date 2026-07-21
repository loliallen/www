import type { MetadataRoute } from "next";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_META,
  SITE_URL,
} from "@/i18n/config";
import { indexableEntries, pathFor } from "@/site/routes";

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

  return indexableEntries().map(({ key, locale, slug }) => ({
    url: `${SITE_URL}${pathFor(key, locale, slug)}`,
    lastModified,
    alternates: {
      languages: {
        ...Object.fromEntries(
          LOCALES.map((l) => [
            LOCALE_META[l].bcp47,
            `${SITE_URL}${pathFor(key, l, slug)}`,
          ]),
        ),
        "x-default": `${SITE_URL}${pathFor(key, DEFAULT_LOCALE, slug)}`,
      },
    },
  }));
}
