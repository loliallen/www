# SEO optimization + audience-funnel IA for maxim.kasakin.tech

**Date:** 2026-07-14
**Status:** Approved (pending spec review)

## Problem

The site is live at `https://maxim.kasakin.tech` but is not findable in Google. Two
independent, confirmed de-indexing bugs explain this. Both were verified against the
**live production site**, not inferred from source - they are invisible in the source and
in the rendered page, which is why they survived this long.

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
sitemap consists entirely of cross-domain URLs, which Google rejects outright.

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

### Bug 3 (structural): route SEO is hand-written per page

`src/app/sitemap.ts:25` hardcodes `const staticPaths = ["", "/services", "/cv"]`. Adding a
route means remembering to touch the sitemap, the canonical, and the hreflang set
independently. Bug 2 *is* an instance of this: a page that forgets `alternates` silently
inherits a wrong one. `/en/work` currently **404s** - the case studies at `/work/{slug}`
have no parent index, another symptom of routes not being modelled anywhere.

Given the site is planned to grow (see IA below), this class of bug will recur. It is
treated as a first-class bug, not a refactor.

## Goals

1. **Own the branded query** - "Maxim Kasakin" / "Максим Касакин". Realistic and winnable.
2. **Get every page indexed**, including the long-tail technical terms the case studies
   already sit on (Cosmos SDK wallet backend, Wyvern NFT marketplace, multi-model AI
   orchestration).
3. **Be citable by AI agents** (ChatGPT, Claude, Perplexity, AI Overviews).
4. **Make the two-audience funnel explicit in the route structure.**

### Explicit non-goals

- **Head hiring keywords** ("golang backend engineer") are unreachable for a personal site
  on a `.tech` subdomain with no backlink profile; those SERPs belong to LinkedIn, Indeed
  and job boards. Not pursued.
- **No blog, no body-copy rewrites.** Consequence to accept: this work makes the site
  *findable*, not *competitive on keywords*. Keyword competition needs content and is a
  separate effort.

## Information architecture

Two audiences, one entry point each:

| Audience | Entry point | Then |
|---|---|---|
| **Recruiters** | `/{lang}/experience` | → `/{lang}/experience/{slug}` (case studies) → `/{lang}/cv` (print artifact) |
| **Clients** | `/{lang}/services` | → `/{lang}/services/{slug}` |

### Why `/experience` absorbs `/work`

The three roles in `resume.ts` map **1:1** onto the three case studies in
`work/projects.ts`:

| Role | Case study |
|---|---|
| Kineiro LLC, 2025- | content-automation-platform |
| NGINE-LTD, 2023-25 | blockchain-wallet-backend |
| Club1111, 2021-22 | nft-marketplace-dapp |

"Where I worked" and "what I built" are, for this person, the same three facts. Two pages
listing the same three companies would be near-duplicate content competing for the same
query - Google would pick one and suppress the other. So there is **one** page.

`/{lang}/experience` lists the roles chronologically (company, title, location, period,
context, bullets from `resume.ts`), each linking to its case study. It is simultaneously
the employment history and the project portfolio. `/work/*` ceases to exist.

**This becomes wrong the day the 1:1 mapping breaks** - side projects with no employer,
multiple case studies per job, or older roles with no case study. At that point "where I
worked" and "what I built" genuinely diverge and deserve separate pages. Not before.

### URL migration is free right now

The site is effectively not in Google's index, so moving `/work/{slug}` →
`/experience/{slug}` costs nothing: no lost equity, no ranking dip. Permanent redirects
are still added as cheap insurance for links already pasted into Telegram/LinkedIn.

### `/cv` is an artifact, not a search entry point

`/cv` renders the same three roles as `/experience` (both from `resume.ts`). Rather than
let them compete, `/cv` gets `robots: { index: false, follow: true }`:

- Search finds `/experience`; `/experience` hands over `/cv`.
- `/cv` stays fully functional and printable (Print → Save as PDF), reachable from the
  header, from `/experience`, and from LinkedIn.
- `follow: true` so link equity still flows out of it.
- **Consequence:** `/cv` must be **removed from the sitemap**. Submitting a noindex URL in
  a sitemap is a Search Console error ("Submitted URL marked noindex"). The route registry
  makes this automatic.

## Design

### Part 0 - Route registry (the structural fix)

`src/site/routes.ts` becomes the single source of truth for the route surface:

```ts
export type Audience = "client" | "recruiter" | "shared";

export const ROUTES = {
  home:        { path: () => "",                    indexable: true,  audience: "shared"    },
  experience:  { path: () => "/experience",         indexable: true,  audience: "recruiter" },
  experienceItem: { path: (s) => `/experience/${s}`, indexable: true, audience: "recruiter",
                    params: () => projects.map((p) => p.slug) },
  services:    { path: () => "/services",           indexable: true,  audience: "client"    },
  serviceItem: { path: (s) => `/services/${s}`,     indexable: true,  audience: "client",
                 params: () => serviceSlugs },
  cv:          { path: () => "/cv",                 indexable: false, audience: "recruiter" },
} as const;
```

Everything derives from it rather than restating it:

- **`sitemap.ts`** iterates the registry × locales, skipping `indexable: false`. It cannot
  forget a page, and `/cv` drops out automatically.
- **`metadataFor(route, lang, params?)`** returns `alternates.canonical`, `alternates.languages`
  (incl. `x-default`), `robots` (noindex when `indexable: false`) and `openGraph.url` in one
  call. **A page that does not write a canonical cannot have a wrong one, because no page
  writes one.** Bug 2 becomes unrepresentable rather than merely fixed.
- **Breadcrumbs** and **`llms.txt`** derive from the same registry.
- **`audience`** encodes the funnel in code, so a new route must declare which one it serves.

### Part 1 - Repair the de-indexing bugs

- Set `SITE_URL = "https://maxim.kasakin.tech"`; delete the TODO. Hardcoded, not
  env-derived: canonicals must always name the production origin so preview deployments
  canonicalize to production rather than to themselves.
- Route every page's metadata through `metadataFor()` (Part 0), including `/cv` and the
  case studies, which currently supply none.

### Part 2 - hreflang and metadata gaps

- **`x-default`** hreflang everywhere (currently absent). Next supports `"x-default"` as a
  key in `alternates.languages`.
- **`title.template`** on the layout: `%s | Maxim Kasakin` / `%s | Максим Касакин`, with a
  `default`. **Interaction:** all six `metaTitle` values in `src/content/services.ts` and the
  `/cv` title already end in `- Maxim Kasakin` / `- Максим Касакин`; the template would double
  the name. Strip the suffix from those strings and let the template own it. Metadata strings,
  not body copy - in scope.
- **`robots: { googleBot: { "max-image-preview": "large" } }`** on the layout - enables large
  thumbnail results instead of text-only.
- **Sitemap**: `lastModified`; drop `changeFrequency` and `priority` (Google documents that it
  ignores both).
- **`robots.txt`**: drop the non-standard `host` directive (Yandex-only, deprecated by Yandex
  since 2018 in favour of canonical tags).

### Part 3 - Structured data

Primary lever for goal #1. Google resolves the string "Maxim Kasakin" to an *entity*; `sameAs`
is how it learns which properties belong to that entity and which is its home.

- **Homepage:** `Person` in a `ProfilePage`, with `sameAs` → GitHub, LinkedIn, Telegram (already
  in `profile.ts`), plus `jobTitle`, `email`, `knowsAbout` (from the existing `SKILLS` array), `url`.
- **`/experience`:** `ProfilePage` → `Person` with `worksFor` (current role) + `hasOccupation`.
- **Case studies:** `Article`.
- **Nested pages:** `BreadcrumbList`, derived from the route registry.
- **Services:** already emit `Service` JSON-LD. Unchanged.

Emitted as `<script type="application/ld+json">`, matching the existing pattern in
`services/[slug]/page.tsx`.

### Part 4 - OG images

Dynamic `opengraph-image.tsx` per locale via `next/og` (ships with Next; no new dependency).

**Honest scoping:** zero effect on Google ranking. Governs how the link renders when pasted into
LinkedIn, Telegram or Slack. Included at the user's request because that channel matters for a job
search - but it is a distinct lever from SEO.

### Part 5 - Search Console (manual; cannot be done in code)

Wire `verification: { google: process.env.GOOGLE_SITE_VERIFICATION }` into the layout, then hand
the user a checklist:

1. Add `maxim.kasakin.tech` as a Search Console property; verify (DNS TXT, or the env var above).
2. Submit `https://maxim.kasakin.tech/sitemap.xml`.
3. Request indexing for `/en`, `/ru`, `/en/experience`, and the three case studies.
4. **Highest-value off-page action, and free:** put `maxim.kasakin.tech` in the GitHub profile
   website field and in LinkedIn contact info. Two high-authority backlinks corroborating the
   entity. The site currently links *out* to both without either linking back.

### Part 6 - llms.txt

Route handler at `src/app/llms.txt/route.ts` returning `text/plain`, **generated from the route
registry and content modules** (`profile.ts`, `resume.ts`, `work/projects.ts`, `services.ts`) rather
than hand-written, so it cannot drift. Contains an identity block, contact channels, and a linked
index of experience / case studies / services.

The proxy matcher (`/((?!_next|.*\..*).*)`) already excludes paths containing a dot, so `/llms.txt`
is not locale-redirected. No proxy change needed.

**Honest scoping:** `llms.txt` is a *proposed* convention (llmstxt.org). No major AI crawler is
documented as discovering or ranking sites by it. AI agents find people through a search index -
Parts 1-3 are what make this site AI-discoverable. `llms.txt` is a courtesy once an agent is
already on the domain. Cheap, no downside, not the mechanism.

Alongside it, the parts that *do* affect AI crawlers:

- Name AI crawlers explicitly in `robots.txt` - `GPTBot`, `OAI-SearchBot`, `ClaudeBot`,
  `PerplexityBot`, `Google-Extended` - all **allowed** (user's explicit choice: maximize
  discoverability; the site is a public professional shopfront). Currently permitted only
  implicitly via `Allow: /`; naming them makes intent explicit and survives default changes.
- Link `llms.txt` from `robots.txt`, the one discovery path agents reliably check.

## Files touched

| File | Change |
|---|---|
| `src/i18n/config.ts` | Fix `SITE_URL`; drop TODO |
| `src/site/routes.ts` | **New** - route registry (path, indexable, audience, params) |
| `src/site/metadata.ts` | **New** - `metadataFor()`; canonical/hreflang/robots/OG from registry |
| `src/site/breadcrumbs.ts` | **New** - `BreadcrumbList` JSON-LD from registry |
| `src/content/resume.ts` | Add optional `caseStudySlug` to `ResumeRole`; populate for 3 roles |
| `src/app/[lang]/layout.tsx` | title template, robots directives, verification, OG, `metadataFor` |
| `src/app/[lang]/page.tsx` | `Person` + `ProfilePage` JSON-LD |
| `src/app/[lang]/experience/page.tsx` | **New** - roles + case-study links (recruiter entry point) |
| `src/app/[lang]/experience/[slug]/page.tsx` | **Moved** from `work/[slug]`; + canonical, OG, `Article` |
| `src/app/[lang]/work/` | **Deleted** |
| `src/app/[lang]/cv/page.tsx` | `noindex, follow`; description; link to `/experience` |
| `src/app/[lang]/services/page.tsx` | Use `metadataFor`; strip title suffix |
| `src/app/[lang]/services/[slug]/page.tsx` | Use `metadataFor` |
| `src/content/services.ts` | Strip `- Maxim Kasakin` suffix from 6 `metaTitle`s |
| `src/components/SiteHeader.tsx` | Add `Experience` nav link (real route, so `next/link`) |
| `src/app/[lang]/dictionaries/{en,ru}.json` | `nav.experience` + experience page copy (4 strings/locale) |
| `src/app/robots.ts` | Real domain, named AI crawlers, `llms.txt` link, drop `host` |
| `src/app/sitemap.ts` | Derive from registry; `x-default`; `lastModified`; drop changefreq/priority |
| `src/app/[lang]/opengraph-image.tsx` | **New** - dynamic OG card |
| `src/app/llms.txt/route.ts` | **New** - generated llms.txt |
| `next.config.ts` | Permanent redirects `/{lang}/work/{slug}` → `/{lang}/experience/{slug}` |

Homepage `#work` anchors (hero CTA, header nav) are repointed at `/experience`.

## Verification

Technical SEO fails silently, so every claim is checked against **emitted HTML**, never source:

1. `npm run build` clean; `npm run lint` clean.
2. Against a local production server, for each of `/en`, `/ru`, `/{lang}/experience`, the three
   `/{lang}/experience/{slug}`, `/{lang}/services`, the three `/{lang}/services/{slug}`:
   - canonical is **self-referential** and on `maxim.kasakin.tech` (regression test for both bugs -
     the case studies must no longer say `/en`)
   - hreflang set includes `en`, `ru`, `x-default`
   - title is unique and not double-branded
3. `/{lang}/cv` emits `noindex, follow` **and** appears nowhere in `sitemap.xml`.
4. `/robots.txt` and `/sitemap.xml` contain **zero** occurrences of `maximkasakin.dev`.
5. `/{lang}/work/{slug}` permanently redirects to `/{lang}/experience/{slug}`; no route 404s that
   the sitemap or an internal link references.
6. JSON-LD validates (Google Rich Results Test); `Person.sameAs` carries all three profiles.
7. `/llms.txt` returns 200, `content-type: text/plain`, not locale-redirected.
8. OG image renders 1200x630 for both locales.

## Expected outcome

Stated plainly so the result is not mistaken for failure:

- **Branded query** - should be won once Google recrawls. The realistic prize.
- **Indexing** - every page type becomes indexable for the first time.
- **Timeline** - **days to weeks** after Search Console submission. Nothing here produces a
  same-day result.
- **Head hiring keywords** - unchanged. Out of scope and out of reach without content.
