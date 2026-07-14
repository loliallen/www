# SEO optimization for maxim.kasakin.tech

**Date:** 2026-07-14
**Status:** Approved (pending spec review)

## Problem

The site is live at `https://maxim.kasakin.tech` but is not findable in Google. Two
independent, confirmed de-indexing bugs explain this. Both were verified against the
live production site, not inferred from source.

### Bug 1: canonical URLs point at a domain that does not exist

`src/i18n/config.ts:13` still carries its scaffolding placeholder:

```ts
/** TODO: set this to the real production domain. */
export const SITE_URL = "https://maximkasakin.dev";
```

`SITE_URL` feeds canonicals, the sitemap, `robots.txt`, and all JSON-LD. Confirmed live:

- `GET /en` returns `<link rel="canonical" href="https://maximkasakin.dev/en">`
- `GET /robots.txt` advertises `Sitemap: https://maximkasakin.dev/sitemap.xml`
- `GET /sitemap.xml` lists only `maximkasakin.dev` URLs
- `maximkasakin.dev` **has no DNS record at all** - it does not resolve

Every page therefore instructs Google to index a dead domain instead of itself, and the
sitemap is composed entirely of cross-domain URLs, which Google rejects outright. This is
the textbook cause of pages landing in Search Console as "Alternative page with proper
canonical tag" - crawled, understood, deliberately not indexed.

### Bug 2: /cv and /work/* canonicalize to the homepage

`src/app/[lang]/layout.tsx:52` sets `alternates.canonical = "/${lang}"`. Next.js merges
metadata down the route tree, so any page that does not override `alternates` inherits it.
`cv/page.tsx` sets only `title`; `work/[slug]/page.tsx` sets only `title` + `description`.
Confirmed live:

| URL | Emitted canonical |
|---|---|
| `/en/cv` | `https://maximkasakin.dev/en` |
| `/en/work/blockchain-wallet-backend` | `https://maximkasakin.dev/en` |
| `/en/services/backend-distributed-systems` | (correct - page sets its own) |

The CV and all three case studies declare themselves duplicates of the homepage. Fixing
Bug 1 alone would still leave the entire non-homepage surface unindexable.

## Goals

Ranked, per the user's stated priorities:

1. **Own the branded query.** "Maxim Kasakin" / "Максим Касакин" should return this site.
   Realistic and winnable.
2. **Get all pages indexed**, including the long-tail technical terms the case studies
   already sit on (Cosmos SDK wallet backend, Wyvern NFT marketplace, multi-model AI
   orchestration).
3. **Be citable by AI agents** (ChatGPT, Claude, Perplexity, AI Overviews).

### Explicit non-goals

- **Head hiring keywords** ("golang backend engineer", "distributed systems engineer") are
  out of reach for a personal site on a `.tech` subdomain with no backlink profile; those
  SERPs are owned by LinkedIn, Indeed, and job boards. Not pursued.
- **No content writing.** No blog, no body-copy rewrites. Scope is technical SEO only, by
  explicit user choice. Consequence to accept: this work makes the site *findable*, not
  *competitive on keywords*. Keyword competition requires content and is a separate effort.

## Design

### Part 1 - Repair the two de-indexing bugs

This part is the actual fix. Everything after it is amplification.

**1a.** Set `SITE_URL = "https://maxim.kasakin.tech"` and delete the TODO comment.
Hardcoded rather than env-derived: canonicals must always name the production origin, so
preview deployments correctly canonicalize to production rather than to themselves.

**1b.** Eliminate the canonical-inheritance hole by construction. `alternates` is currently
hand-built in four places (layout, sitemap, services index, service detail) and *omitted*
in two (cv, work) - which is precisely how the layout's value leaked into them. Introduce a
single helper in the i18n module:

```ts
// src/i18n/alternates.ts
export function alternatesFor(lang: Locale, pathFor: (l: Locale) => string) {
  return {
    canonical: pathFor(lang),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].bcp47, pathFor(l)])),
      "x-default": pathFor(DEFAULT_LOCALE),
    },
  };
}
```

Call it from **every** page, including `/cv` and `/work/[slug]`. This removes the
duplication and closes the hole: a page can no longer silently inherit a wrong canonical,
because supplying alternates becomes the single obvious thing every page does.

### Part 2 - hreflang and metadata gaps

- **`x-default` hreflang** everywhere (currently absent). Tells Google which version to
  serve a user whose language matches neither `en` nor `ru`. Next supports `"x-default"` as
  a key in `alternates.languages`.
- **`title.template`** on the layout: `%s | Maxim Kasakin` / `%s | Максим Касакин`, with a
  `default`. **Interaction to handle:** all six `metaTitle` values in `src/content/services.ts`
  and the `/cv` title already end in `- Maxim Kasakin` / `- Максим Касакин`; the template
  would double the name. Strip the suffix from those strings and let the template own it.
  This is a metadata-string change, not body copy - in scope.
- **`robots: { googleBot: { "max-image-preview": "large" } }`** on the layout. Enables large
  thumbnail results rather than text-only.
- **`/cv`**: add description, canonical, hreflang, OG (currently has title only).
- **`/work/[slug]`**: add canonical, hreflang, OG (`type: "article"`).
- **Sitemap**: add `x-default` alternates and `lastModified`. Drop `changeFrequency` and
  `priority` - Google documents that it ignores both.
- **`robots.txt`**: drop the non-standard `host` directive (Yandex-only, and deprecated by
  Yandex since 2018 in favour of canonical tags).

### Part 3 - Structured data

The primary lever for goal #1. Google resolves the string "Maxim Kasakin" to an *entity*;
`sameAs` is how it learns which web properties belong to that entity and which is its home.

- **Homepage:** `Person` wrapped in `ProfilePage`, with `sameAs` → GitHub, LinkedIn,
  Telegram (already in `profile.ts`), plus `jobTitle`, `email`, `knowsAbout` (drawn from the
  existing `SKILLS` array), `url`.
- **Nested pages:** `BreadcrumbList` - improves how the URL path renders in results.
- **Case studies:** `Article`.
- **Services:** already emit `Service` JSON-LD. Leave as-is.

Emitted as `<script type="application/ld+json">`, matching the existing pattern in
`services/[slug]/page.tsx`.

### Part 4 - OG images

Dynamic `opengraph-image.tsx` per locale via `next/og` (ships with Next; no new dependency).

**Honest scoping:** this has *zero* effect on Google ranking. It governs how the link renders
when pasted into LinkedIn, Telegram, or Slack. Included at the user's request because that
sharing channel matters for a job search - but it is a distinct lever from SEO, not part of it.

### Part 5 - Search Console (manual; cannot be done in code)

Code alone does not get a site indexed. Wire `verification: { google: process.env.GOOGLE_SITE_VERIFICATION }`
into the layout, then hand the user a checklist:

1. Add `maxim.kasakin.tech` as a Search Console property; verify (DNS TXT, or the env var above).
2. Submit `https://maxim.kasakin.tech/sitemap.xml`.
3. Request indexing for `/en`, `/ru`, `/en/cv`, and the three case studies.
4. **Highest-value off-page action, and free:** put `maxim.kasakin.tech` in the GitHub profile
   website field and in LinkedIn contact info. Two high-authority backlinks that corroborate the
   entity. The site currently links *out* to both without either linking back.

### Part 6 - llms.txt

A route handler at `src/app/llms.txt/route.ts` returning `text/plain`, **generated from the
existing content modules** (`profile.ts`, `resume.ts`, `work/projects.ts`, `services.ts`) rather
than hand-written, so it cannot drift out of sync with the site. Contains a short identity block,
contact channels, and a linked index of CV / case studies / services.

The existing proxy matcher (`/((?!_next|.*\..*).*)`) already excludes paths containing a dot, so
`/llms.txt` will not be locale-redirected. No proxy change needed.

**Honest scoping:** `llms.txt` is a *proposed* convention (llmstxt.org). No major AI crawler is
documented as discovering or ranking sites by it. AI agents find people the same way humans do -
through a search index. Parts 1-3 are what make this site AI-discoverable; `llms.txt` is a useful
courtesy once an agent is already on the domain. Cheap, no downside, but not the mechanism.

Alongside it, the parts that *do* affect AI crawlers:

- Name AI crawlers explicitly in `robots.txt` - `GPTBot`, `OAI-SearchBot`, `ClaudeBot`,
  `PerplexityBot`, `Google-Extended` - all **allowed** (user's explicit choice: maximize
  discoverability; the site is a public professional shopfront). Currently permitted only
  implicitly via `Allow: /`; naming them makes intent explicit and survives future default changes.
- Link `llms.txt` from `robots.txt`, the one discovery path agents reliably check.

## Files touched

| File | Change |
|---|---|
| `src/i18n/config.ts` | Fix `SITE_URL`; drop TODO |
| `src/i18n/alternates.ts` | **New** - `alternatesFor()` helper |
| `src/app/[lang]/layout.tsx` | title template, robots directives, verification, OG, use helper |
| `src/app/[lang]/page.tsx` | `Person` + `ProfilePage` JSON-LD |
| `src/app/[lang]/cv/page.tsx` | description, canonical, hreflang, OG, breadcrumbs |
| `src/app/[lang]/work/[slug]/page.tsx` | canonical, hreflang, OG, `Article` + breadcrumbs |
| `src/app/[lang]/services/page.tsx` | use helper; strip title suffix |
| `src/app/[lang]/services/[slug]/page.tsx` | use helper |
| `src/content/services.ts` | strip `- Maxim Kasakin` suffix from 6 `metaTitle`s |
| `src/app/robots.ts` | real domain, named AI crawlers, `llms.txt` link, drop `host` |
| `src/app/sitemap.ts` | `x-default`, `lastModified`, drop changefreq/priority |
| `src/app/[lang]/opengraph-image.tsx` | **New** - dynamic OG card |
| `src/app/llms.txt/route.ts` | **New** - generated llms.txt |

## Verification

Technical SEO fails silently, so every claim must be checked against emitted HTML, not source:

1. `npm run build` clean; `npm run lint` clean.
2. Against a local production server, for **each** of `/en`, `/ru`, `/en/cv`, `/ru/cv`, all three
   `/{lang}/work/*`, `/{lang}/services`, all three `/{lang}/services/*`:
   - canonical is **self-referential** and on `maxim.kasakin.tech` (this is the regression test
     for both bugs - the CV and work pages must no longer say `/en`)
   - hreflang set includes `en`, `ru`, `x-default`
   - title is unique and not double-branded
3. `/robots.txt` and `/sitemap.xml` contain **zero** occurrences of `maximkasakin.dev`.
4. JSON-LD validates (Google Rich Results Test) and `Person.sameAs` carries all three profiles.
5. `/llms.txt` returns 200, `content-type: text/plain`, and is not locale-redirected.
6. OG image renders at 1200x630 for both locales.

## Expected outcome

Honest expectations, to avoid the user concluding it failed:

- **Branded query** - should be won once Google recrawls. This is the realistic prize.
- **Indexing** - all six page types become indexable for the first time.
- **Timeline** - indexing is not instant. Expect days-to-weeks after Search Console submission.
  Nothing in this work produces a same-day result.
- **Head hiring keywords** - unchanged. Out of scope, and out of reach without content.
