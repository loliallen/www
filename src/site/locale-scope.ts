import { LOCALES, type Locale } from "@/i18n/config";
import { getPost, posts } from "@/content/blog/posts";

/**
 * Which locales a path is published in, decided from the path alone.
 *
 * The language switcher runs in the browser and needs this, but it must not
 * import the route registry: that would drag every project and service - both
 * locales of each - into the client bundle. So the rule lives here, over the
 * one small registry it genuinely needs, and routes.test.ts asserts the answer
 * matches the registry for every route, locale and slug.
 */
export function localesForPath(pathname: string): Locale[] {
  const post = /^\/[a-z]{2}\/blog\/([^/]+)\/?$/.exec(pathname);
  if (post) {
    const found = getPost(post[1]);
    if (found) return [found.locale];
  }

  if (/^\/[a-z]{2}\/blog\/?$/.test(pathname)) {
    const present = new Set(posts.map((p) => p.locale));
    return LOCALES.filter((l) => present.has(l));
  }

  return [...LOCALES];
}
