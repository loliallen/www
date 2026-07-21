import type { Metadata } from "next";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_META,
  SITE_URL,
  type Locale,
} from "@/i18n/config";
import { ROUTES, pathFor, type RouteKey } from "./routes";

/**
 * Builds the SEO-critical half of a page's Metadata from the route registry.
 *
 * Pages must never hand-write `alternates`. Next merges metadata down the route
 * tree, so a page that omits a canonical silently inherits its layout's - which
 * is how /cv and every case study came to declare themselves duplicates of the
 * homepage. Deriving it here means a wrong canonical is not expressible.
 */
export function metadataFor(
  key: RouteKey,
  locale: Locale,
  opts: { slug?: string; title?: string; description?: string } = {},
): Metadata {
  const { slug, title, description } = opts;
  const canonical = pathFor(key, locale, slug);

  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[LOCALE_META[l].bcp47] = pathFor(key, l, slug);
  }
  // Tells Google which version to serve a user whose language matches neither.
  languages["x-default"] = pathFor(key, DEFAULT_LOCALE, slug);

  return {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    alternates: { canonical, languages },
    // Left undefined on indexable routes so the layout's googleBot defaults apply.
    ...(ROUTES[key].indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      url: `${SITE_URL}${canonical}`,
      locale: LOCALE_META[locale].bcp47,
      type: "website",
      // Named explicitly, not inherited: Next only passes a layout's openGraph
      // (and with it the opengraph-image file convention) down to pages that set
      // no openGraph of their own. Every page here sets one, so without this only
      // the homepage would render a link card.
      images: [{ url: `/${locale}/opengraph-image`, width: 1200, height: 630 }],
    },
  };
}
