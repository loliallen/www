import { LOCALES, type Locale } from "@/i18n/config";
import { projects } from "@/content/work/projects";
import { serviceSlugs } from "@/content/services";
import { posts, postSlugs, getPost } from "@/content/blog/posts";

/** Which funnel a route serves. Clients enter at /services, recruiters at /experience. */
export type Audience = "client" | "recruiter" | "shared";

export type RouteKey =
  | "home"
  | "experience"
  | "experienceItem"
  | "services"
  | "serviceItem"
  | "blog"
  | "blogPost"
  | "cv";

export type RouteDef = {
  /** Path below the /{locale} prefix. "" for home. */
  path: (slug?: string) => string;
  /** False means: noindex, and absent from the sitemap. */
  indexable: boolean;
  audience: Audience;
  /** Present only on dynamic routes. Supplies every slug the route expands to. */
  params?: () => string[];
  /**
   * Locales this route is published in, per slug. Absent means all of them.
   * A route that serves fewer must not appear in the others' hreflang or in
   * the sitemap: pointing Google at a URL that 404s is worse than having no
   * translation at all. Called without a slug it answers for the route as a
   * whole - the union over its slugs.
   */
  locales?: (slug?: string) => readonly Locale[];
  /** Breadcrumb parent. Absent on the root. */
  parent?: RouteKey;
};

/**
 * Single source of truth for the route surface. The sitemap, canonicals,
 * hreflang, breadcrumbs and llms.txt all derive from this - so adding a route
 * here is the only step needed to make it correctly discoverable.
 */
export const ROUTES: Record<RouteKey, RouteDef> = {
  home: {
    path: () => "",
    indexable: true,
    audience: "shared",
  },
  experience: {
    path: () => "/experience",
    indexable: true,
    audience: "recruiter",
    parent: "home",
  },
  experienceItem: {
    path: (slug) => `/experience/${slug}`,
    indexable: true,
    audience: "recruiter",
    parent: "experience",
    params: () => projects.map((p) => p.slug),
  },
  services: {
    path: () => "/services",
    indexable: true,
    audience: "client",
    parent: "home",
  },
  serviceItem: {
    path: (slug) => `/services/${slug}`,
    indexable: true,
    audience: "client",
    parent: "services",
    params: () => [...serviceSlugs],
  },
  // The blog is published only in the languages it actually has posts in: an
  // empty index in another locale would be a thin page competing for nothing.
  blog: {
    path: () => "/blog",
    indexable: true,
    audience: "client",
    parent: "home",
    locales: () => postLocales(),
  },
  blogPost: {
    path: (slug) => `/blog/${slug}`,
    indexable: true,
    audience: "client",
    parent: "blog",
    params: () => [...postSlugs],
    locales: (slug) => {
      const post = slug ? getPost(slug) : undefined;
      return post ? [post.locale] : postLocales();
    },
  },
  // The CV is a print -> PDF artifact, not a search landing page. It renders the
  // same roles as /experience, so indexing both would make them compete.
  cv: {
    path: () => "/cv",
    indexable: false,
    audience: "recruiter",
    parent: "home",
  },
};

/** Locales the blog has posts in, in the order the site declares its locales. */
function postLocales(): Locale[] {
  const present = new Set(posts.map((p) => p.locale));
  return LOCALES.filter((l) => present.has(l));
}

/** The locales a route is published in - every locale unless it says otherwise. */
export function localesFor(key: RouteKey, slug?: string): Locale[] {
  return [...(ROUTES[key].locales?.(slug) ?? LOCALES)];
}

/** Locale-prefixed path for a route, e.g. `/en/experience/nft-marketplace-dapp`. */
export function pathFor(key: RouteKey, locale: Locale, slug?: string): string {
  return `/${locale}${ROUTES[key].path(slug)}`;
}

/** Every indexable (route, locale, slug) triple - the complete sitemap surface. */
export function indexableEntries(): Array<{
  key: RouteKey;
  locale: Locale;
  slug?: string;
}> {
  const entries: Array<{ key: RouteKey; locale: Locale; slug?: string }> = [];

  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    const route = ROUTES[key];
    if (!route.indexable) continue;

    const slugs = route.params ? route.params() : [undefined];
    for (const slug of slugs) {
      for (const locale of localesFor(key, slug)) {
        entries.push({ key, locale, slug });
      }
    }
  }

  return entries;
}
