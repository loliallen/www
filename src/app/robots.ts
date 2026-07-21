import type { MetadataRoute } from "next";
import { SITE_URL } from "@/i18n/config";

/**
 * AI crawlers are named explicitly rather than left to the `*` rule: the intent
 * is to be discoverable and citable, and naming them survives future changes to
 * a crawler's default behaviour.
 *
 * The `Host` directive is gone - it is non-standard (Yandex-only, and deprecated
 * by Yandex since 2018 in favour of canonical tags).
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
