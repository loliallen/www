import { LOCALE_META, SITE_URL, type Locale } from "@/i18n/config";
import { posts } from "@/content/blog/posts";
import { nameFor, profile } from "@/content/profile";
import { pathFor } from "./routes";

/** XML has five predefined entities; everything else in the feed is text. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * RFC 822, which RSS 2.0 requires - not ISO 8601. Readers that get an ISO date
 * here either drop the item or sort it to the epoch.
 */
export function rfc822(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toUTCString();
}

/** RSS 2.0 feed of one locale's posts, newest first. */
export function renderFeed(locale: Locale, labels: { title: string; description: string }): string {
  const self = `${SITE_URL}${pathFor("blog", locale)}/feed.xml`;
  const items = posts
    .filter((p) => p.locale === locale)
    .sort((a, b) => b.published.localeCompare(a.published))
    .map((p) => {
      const url = `${SITE_URL}${pathFor("blogPost", locale, p.slug)}`;
      return [
        "    <item>",
        `      <title>${escapeXml(p.metaTitle)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${rfc822(p.published)}</pubDate>`,
        `      <description>${escapeXml(p.metaDescription)}</description>`,
        "    </item>",
      ].join("\n");
    });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(labels.title)}</title>`,
    `    <link>${SITE_URL}${pathFor("blog", locale)}</link>`,
    `    <description>${escapeXml(labels.description)}</description>`,
    `    <language>${LOCALE_META[locale].bcp47}</language>`,
    // The blog's own inbox, not the hiring one - this feed is the blog.
    `    <managingEditor>${profile.gameServerEmail} (${escapeXml(nameFor(locale))})</managingEditor>`,
    `    <atom:link href="${self}" rel="self" type="application/rss+xml" />`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
