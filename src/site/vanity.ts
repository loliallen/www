import { SITE_URL } from "@/i18n/config";

/**
 * blog.kasakin.tech is a vanity address, not a second site. Everything it
 * receives lands on the blog section of the main domain, so inbound links,
 * search ranking and analytics accumulate in one place instead of being split
 * across two hosts.
 *
 * This runs in the proxy rather than as a `next.config` redirect: the proxy
 * sees the request first and would otherwise rewrite the path to a locale
 * before any redirect rule matched.
 *
 * The target locale is fixed because Russian is the only language the blog
 * publishes in. When an English post exists, this becomes a language choice.
 */
const VANITY_HOSTS: Record<string, string> = {
  "blog.kasakin.tech": "/ru/blog",
};

/** Absolute destination for a vanity host, or null when the host is not one. */
export function vanityRedirect(
  host: string | null,
  pathname: string,
): string | null {
  const base = VANITY_HOSTS[(host ?? "").toLowerCase().split(":")[0]];
  if (!base) return null;

  const rest = pathname.replace(/\/+$/, "");
  return `${SITE_URL}${base}${rest}`;
}
