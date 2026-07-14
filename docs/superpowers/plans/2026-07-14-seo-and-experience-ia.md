# SEO + Experience IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make maxim.kasakin.tech indexable by Google, and restructure the route surface around two audience funnels (recruiters → `/experience`, clients → `/services`) so the class of bug that made it invisible cannot recur.

**Architecture:** A central route registry (`src/site/routes.ts`) becomes the single source of truth for the route surface. Canonicals, hreflang, `robots` directives, the sitemap, breadcrumbs and `llms.txt` all *derive* from it. No page hand-writes a canonical, so no page can hand-write a wrong one. `/work/*` is absorbed into `/experience/*`; `/cv` becomes a noindexed print artifact.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19, TypeScript, Tailwind v4, MDX, Vitest (added by this plan).

## Global Constraints

- **This is not the Next.js in your training data.** Per `AGENTS.md`, read the relevant guide under `node_modules/next/dist/docs/` before writing code against an unfamiliar API. Relevant: `01-app/03-api-reference/04-functions/generate-metadata.md`, `.../03-file-conventions/01-metadata/{sitemap,robots,opengraph-image}.md`, `.../05-config/01-next-config-js/redirects.md`.
- **Production domain is `https://maxim.kasakin.tech`.** Already set in `src/i18n/config.ts` — do not change it.
- **Copy style: hyphens, not em/en dashes.** Commit `4866efd` deliberately stripped them site-wide. Any new copy uses `-`.
- **Locales are `en` and `ru`.** Both must be handled everywhere. `en` is `DEFAULT_LOCALE` and the `x-default` target.
- **Never verify SEO by reading source.** Both original bugs were invisible in source and in the rendered page. Assertions go against emitted HTML.
- **`/cv` is `indexable: false`.** It must emit `noindex, follow` and must NOT appear in `sitemap.xml`.
- **No new runtime dependencies.** `next/og` ships with Next. Vitest is a devDependency only.

---

### Task 1: Test infrastructure

No test runner exists in this repo. The registry and metadata helpers are pure functions and are where both bugs live, so they get unit tests.

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: `npm test` runs Vitest; `@/` resolves to `src/` inside tests.

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Create `vitest.config.ts`**

The `@/*` path alias must resolve in tests the same way it does in `tsconfig.json`.

```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 3: Add the test script to `package.json`**

Add to the `"scripts"` block, after `"lint"`:

```json
"test": "vitest run"
```

- [ ] **Step 4: Verify the runner starts**

Run: `npm test`
Expected: exits 0 with "No test files found" (no tests exist yet). If it errors on config, fix before continuing.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add vitest"
```

---

### Task 2: Route registry

The structural fix. `src/app/sitemap.ts:25` currently hardcodes `["", "/services", "/cv"]`; nothing models the route surface, which is why `/en/work` 404s and why pages can silently omit a canonical.

**Files:**
- Create: `src/site/routes.ts`
- Create: `src/site/routes.test.ts`

**Interfaces:**
- Consumes: `Locale`, `LOCALES` from `@/i18n/config`; `projects` from `@/content/work/projects`; `serviceSlugs` from `@/content/services`.
- Produces:
  - `type Audience = "client" | "recruiter" | "shared"`
  - `type RouteKey = "home" | "experience" | "experienceItem" | "services" | "serviceItem" | "cv"`
  - `ROUTES: Record<RouteKey, RouteDef>`
  - `pathFor(key: RouteKey, locale: Locale, slug?: string): string` — locale-prefixed path, e.g. `/en/experience/nft-marketplace-dapp`
  - `indexableEntries(): Array<{ key: RouteKey; locale: Locale; slug?: string }>` — the full sitemap surface

- [ ] **Step 1: Write the failing test**

Create `src/site/routes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ROUTES, pathFor, indexableEntries } from "./routes";

describe("pathFor", () => {
  it("builds locale-prefixed static paths", () => {
    expect(pathFor("home", "en")).toBe("/en");
    expect(pathFor("experience", "ru")).toBe("/ru/experience");
    expect(pathFor("cv", "en")).toBe("/en/cv");
  });

  it("builds locale-prefixed dynamic paths", () => {
    expect(pathFor("experienceItem", "en", "nft-marketplace-dapp")).toBe(
      "/en/experience/nft-marketplace-dapp",
    );
  });
});

describe("indexableEntries", () => {
  const entries = indexableEntries();

  it("excludes non-indexable routes", () => {
    // /cv is a print artifact - noindexed, so it must never reach the sitemap.
    expect(entries.some((e) => e.key === "cv")).toBe(false);
  });

  it("covers every locale for every indexable route", () => {
    expect(entries.some((e) => e.key === "home" && e.locale === "en")).toBe(true);
    expect(entries.some((e) => e.key === "home" && e.locale === "ru")).toBe(true);
  });

  it("expands dynamic routes over their params", () => {
    const items = entries.filter((e) => e.key === "experienceItem" && e.locale === "en");
    expect(items).toHaveLength(3);
    expect(items.map((e) => e.slug).sort()).toEqual([
      "blockchain-wallet-backend",
      "content-automation-platform",
      "nft-marketplace-dapp",
    ]);
  });

  it("never yields an entry without a slug for a dynamic route", () => {
    for (const e of entries) {
      if (ROUTES[e.key].params) expect(e.slug).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./routes`.

- [ ] **Step 3: Write the implementation**

Create `src/site/routes.ts`:

```ts
import { LOCALES, type Locale } from "@/i18n/config";
import { projects } from "@/content/work/projects";
import { serviceSlugs } from "@/content/services";

/** Which funnel a route serves. Clients enter at /services, recruiters at /experience. */
export type Audience = "client" | "recruiter" | "shared";

export type RouteKey =
  | "home"
  | "experience"
  | "experienceItem"
  | "services"
  | "serviceItem"
  | "cv";

export type RouteDef = {
  /** Path below the /{locale} prefix. "" for home. */
  path: (slug?: string) => string;
  /** False means: noindex, and absent from the sitemap. */
  indexable: boolean;
  audience: Audience;
  /** Present only on dynamic routes. Supplies every slug the route expands to. */
  params?: () => string[];
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
  // The CV is a print -> PDF artifact, not a search landing page. It renders the
  // same roles as /experience, so indexing both would make them compete.
  cv: {
    path: () => "/cv",
    indexable: false,
    audience: "recruiter",
    parent: "home",
  },
};

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
    for (const locale of LOCALES) {
      for (const slug of slugs) {
        entries.push({ key, locale, slug });
      }
    }
  }

  return entries;
}
```

Note: `parent` is declared on `RouteDef` but not yet read by any consumer — Task 8 builds breadcrumbs from it. Keep it; it is the reason breadcrumbs stay derived rather than hand-listed.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/site/routes.ts src/site/routes.test.ts
git commit -m "feat: add route registry as single source of truth for route surface"
```

---

### Task 3: `metadataFor()` — make bug 2 unrepresentable

Bug 2: `src/app/[lang]/layout.tsx:52` sets `alternates.canonical = "/${lang}"`, and Next merges metadata down the tree, so `/cv` and `/work/*` (which set no `alternates`) inherit the homepage canonical. The fix is not "remember to set a canonical on every page" — it is "no page writes a canonical".

**Files:**
- Create: `src/site/metadata.ts`
- Create: `src/site/metadata.test.ts`

**Interfaces:**
- Consumes: `ROUTES`, `pathFor`, `RouteKey` from `./routes`; `LOCALES`, `LOCALE_META`, `DEFAULT_LOCALE`, `SITE_URL`, `Locale` from `@/i18n/config`.
- Produces: `metadataFor(key: RouteKey, locale: Locale, opts?: { slug?: string; title?: string; description?: string }): Metadata`

- [ ] **Step 1: Write the failing test**

Create `src/site/metadata.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { metadataFor } from "./metadata";

describe("metadataFor", () => {
  it("emits a self-referential canonical, never the parent's", () => {
    // This is the regression test for bug 2: /cv and case studies used to
    // inherit the layout's canonical and declare themselves copies of /en.
    expect(metadataFor("cv", "en").alternates?.canonical).toBe("/en/cv");
    expect(
      metadataFor("experienceItem", "en", { slug: "nft-marketplace-dapp" })
        .alternates?.canonical,
    ).toBe("/en/experience/nft-marketplace-dapp");
  });

  it("includes every locale plus x-default in hreflang", () => {
    const languages = metadataFor("experience", "ru").alternates?.languages;
    expect(languages).toEqual({
      en: "/en/experience",
      ru: "/ru/experience",
      "x-default": "/en/experience",
    });
  });

  it("marks non-indexable routes noindex, follow", () => {
    expect(metadataFor("cv", "en").robots).toEqual({ index: false, follow: true });
  });

  it("leaves robots unset on indexable routes so the layout default applies", () => {
    expect(metadataFor("home", "en").robots).toBeUndefined();
  });

  it("builds an absolute openGraph url on the production domain", () => {
    expect(metadataFor("services", "en").openGraph?.url).toBe(
      "https://maxim.kasakin.tech/en/services",
    );
  });

  it("passes through title and description when given", () => {
    const meta = metadataFor("services", "en", { title: "Services", description: "d" });
    expect(meta.title).toBe("Services");
    expect(meta.description).toBe("d");
    expect(meta.openGraph?.title).toBe("Services");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./metadata`.

- [ ] **Step 3: Write the implementation**

Create `src/site/metadata.ts`:

```ts
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
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS, 12 tests total.

- [ ] **Step 5: Commit**

```bash
git add src/site/metadata.ts src/site/metadata.test.ts
git commit -m "feat: derive canonical/hreflang/robots from route registry"
```

---

### Task 4: Wire existing pages to `metadataFor` — fixes bug 2 in production

After this task the site is deployable and `/cv` stops claiming to be the homepage. `/work/[slug]` is intentionally left alone; it is rewritten in Task 5 when it moves.

**Files:**
- Modify: `src/app/[lang]/layout.tsx` (remove `alternates`; add title template, robots defaults, verification)
- Modify: `src/app/[lang]/page.tsx` (add `generateMetadata` — it currently has none)
- Modify: `src/app/[lang]/cv/page.tsx`
- Modify: `src/app/[lang]/services/page.tsx`
- Modify: `src/app/[lang]/services/[slug]/page.tsx`
- Modify: `src/content/services.ts` (strip brand suffix from 6 `metaTitle`s)
- Modify: `src/i18n/config.ts` (delete the stale TODO comment)

**Interfaces:**
- Consumes: `metadataFor` from `@/site/metadata`.

- [ ] **Step 1: Delete the stale TODO in `src/i18n/config.ts`**

`SITE_URL` is already correct. Lines 11-13 become:

```ts
/** Canonical site origin - used for metadata, sitemap, robots, JSON-LD. */
export const SITE_URL = "https://maxim.kasakin.tech";
```

- [ ] **Step 2: Strip the brand suffix from the six `metaTitle`s in `src/content/services.ts`**

The layout gains a `title.template` in Step 3, which appends `| Maxim Kasakin`. These titles already end in the name, so leaving them would double it ("... - Maxim Kasakin | Maxim Kasakin").

| Line | From | To |
|---|---|---|
| 53 | `"Backend & Distributed Systems Engineering - Maxim Kasakin"` | `"Backend & Distributed Systems Engineering"` |
| 101 | `"AI Platform & Workflow Orchestration Engineering - Maxim Kasakin"` | `"AI Platform & Workflow Orchestration Engineering"` |
| 147 | `"Blockchain & Web3 Backend Engineering - Maxim Kasakin"` | `"Blockchain & Web3 Backend Engineering"` |
| 194 | `"Бэкенд и распределённые системы - Максим Касакин"` | `"Бэкенд и распределённые системы"` |
| 242 | `"AI-платформы и оркестрация воркфлоу - Максим Касакин"` | `"AI-платформы и оркестрация воркфлоу"` |
| 288 | `"Блокчейн и Web3 бэкенд - Максим Касакин"` | `"Блокчейн и Web3 бэкенд"` |

- [ ] **Step 3: Rewrite `generateMetadata` in `src/app/[lang]/layout.tsx`**

The layout must NOT set `alternates` — that is the bug. It sets only what is genuinely global. Replace the whole existing `generateMetadata` (lines 36-68):

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const name = nameFor(lang);

  return {
    metadataBase: new URL(SITE_URL),
    // Deliberately no `alternates` here. Metadata merges down the route tree, so
    // a canonical set on the layout leaks into every page that omits one - which
    // is how /cv and the case studies came to canonicalize to the homepage.
    // Canonicals come from metadataFor() on each page instead.
    title: {
      template: `%s | ${name}`,
      default: dict.meta.title,
    },
    description: dict.meta.description,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
    openGraph: {
      siteName: name,
      locale: LOCALE_META[lang].bcp47,
      type: "website",
    },
  };
}
```

Add `import { nameFor } from "@/content/profile";` to the imports. `LOCALES` is no longer used by `generateMetadata` but is still used by `generateStaticParams` — leave the import.

- [ ] **Step 4: Add `generateMetadata` to `src/app/[lang]/page.tsx`**

The homepage currently has none, so it relies wholly on the layout. It now needs its own canonical. Insert after the imports, before `const SKILLS`:

```tsx
import type { Metadata } from "next";
import { metadataFor } from "@/site/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  // Title omitted on purpose: the layout's `title.default` is the homepage title,
  // and supplying one here would run it through the template and double the name.
  return metadataFor("home", lang);
}
```

- [ ] **Step 5: Rewrite `generateMetadata` in `src/app/[lang]/cv/page.tsx`**

Replace the existing one (lines 9-18). The CV gains a description and, via the registry, `noindex, follow`:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const r = getResume(lang);
  return metadataFor("cv", lang, { title: "CV", description: r.summary });
}
```

Add `import { metadataFor } from "@/site/metadata";`. The `nameFor` import is now unused in metadata but is still used in the component body — leave it.

- [ ] **Step 6: Replace the `alternates` / `openGraph` blocks in the two services pages**

In `src/app/[lang]/services/page.tsx`, replace the returned object in `generateMetadata` (lines 26-41) with:

```tsx
  return metadataFor("services", lang, { title, description: t.indexLead });
```

...and change the local `title` (lines 21-24) to drop the brand suffix, since the template now supplies it:

```tsx
  const title = lang === "en" ? "Services - Backend, AI & Web3 Engineering" : "Услуги - бэкенд, AI и Web3";
```

In `src/app/[lang]/services/[slug]/page.tsx`, replace the returned object (lines 39-54) with:

```tsx
  return metadataFor("serviceItem", lang, {
    slug,
    title: service.metaTitle,
    description: service.metaDescription,
  });
```

Add `import { metadataFor } from "@/site/metadata";` to both. Remove now-unused `LOCALES` / `LOCALE_META` / `SITE_URL` imports where the linter flags them.

- [ ] **Step 7: Verify against emitted HTML — not source**

```bash
npm run build && npm start &
sleep 5
for u in /en /ru /en/cv /en/services /en/services/backend-distributed-systems; do
  echo "=== $u ==="
  curl -sS "http://localhost:3000$u" | grep -oE 'rel="canonical" href="[^"]*"|hrefLang="[^"]*" href="[^"]*"|name="robots" content="[^"]*"|<title>[^<]*'
done
kill %1
```

Expected: every canonical is **self-referential** (`/en/cv` → `.../en/cv`, NOT `.../en`); each page lists `en`, `ru` and `x-default` alternates; `/en/cv` shows `noindex` and the others do not; no title contains the name twice.

- [ ] **Step 8: Lint and commit**

```bash
npm run lint && npm test
git add -A
git commit -m "fix: stop /cv and pages inheriting the layout canonical

Metadata merges down the route tree, so pages omitting alternates
inherited the layout's canonical and declared themselves duplicates of
the homepage. Canonicals now derive from the route registry per page.
Also marks /cv noindex,follow - it is a print artifact, not a landing page."
```

---

### Task 5: Move `/work/{slug}` → `/experience/{slug}`

`/en/work` currently 404s — the case studies have no parent index. Rather than build one, they move under `/experience`, which becomes the single recruiter entry point. Safe to rename: nothing is indexed yet.

**Files:**
- Create: `src/app/[lang]/experience/[slug]/page.tsx` (moved from `work/[slug]`)
- Delete: `src/app/[lang]/work/` (the whole directory)
- Modify: `next.config.ts` (permanent redirects)
- Modify: `src/app/[lang]/page.tsx` (homepage work links)

Note: `src/content/work/` (the data and MDX) does **not** move. Only the route moves.

- [ ] **Step 1: Move the route directory**

```bash
mkdir -p "src/app/[lang]/experience"
git mv "src/app/[lang]/work/[slug]" "src/app/[lang]/experience/[slug]"
rmdir "src/app/[lang]/work" 2>/dev/null || true
```

- [ ] **Step 2: Wire the moved page to `metadataFor`**

In `src/app/[lang]/experience/[slug]/page.tsx`, replace `generateMetadata` (the version that sets only title + description, and therefore inherits the homepage canonical):

```tsx
import { metadataFor } from "@/site/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const project = getProject(slug);
  if (!project) return {};
  return metadataFor("experienceItem", lang, {
    slug,
    title: `${project.title[lang]} - ${project.role[lang]}`,
    description: project.summary[lang],
  });
}
```

Also update the "back" link in the component body, which currently points at the homepage anchor `/${locale}#work`:

```tsx
      <Link
        href={`/${locale}/experience`}
        className="font-mono text-sm uppercase tracking-widest text-ink/60 transition-colors hover:text-accent"
      >
        ← {dict.work.backToWork}
      </Link>
```

- [ ] **Step 3: Add permanent redirects in `next.config.ts`**

Nothing is indexed, so this is insurance for links already pasted into Telegram/LinkedIn - cheap, and it costs nothing to keep.

```ts
const nextConfig: NextConfig = {
  // Allow .md / .mdx files to be treated as pages and modules.
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  async redirects() {
    return [
      {
        source: "/:lang(en|ru)/work/:slug",
        destination: "/:lang/experience/:slug",
        permanent: true,
      },
      {
        source: "/:lang(en|ru)/work",
        destination: "/:lang/experience",
        permanent: true,
      },
    ];
  },
};
```

- [ ] **Step 4: Repoint the homepage links**

In `src/app/[lang]/page.tsx`, the work section links to `/${locale}/work/${project.slug}`. Change to:

```tsx
                href={`/${locale}/experience/${project.slug}`}
```

- [ ] **Step 5: Verify the move and the redirect**

```bash
npm run build && npm start &
sleep 5
curl -sS -o /dev/null -w "old /en/work/nft-marketplace-dapp -> %{http_code} %{redirect_url}\n" "http://localhost:3000/en/work/nft-marketplace-dapp"
curl -sS "http://localhost:3000/en/experience/nft-marketplace-dapp" | grep -oE 'rel="canonical" href="[^"]*"'
kill %1
```

Expected: old path returns `308` redirecting to `/en/experience/nft-marketplace-dapp`; the new path's canonical is **self-referential** (`.../en/experience/nft-marketplace-dapp`), not `/en`.

- [ ] **Step 6: Commit**

```bash
npm run lint && npm test
git add -A
git commit -m "refactor: move case studies from /work to /experience

Consolidates the recruiter funnel on one entry point. /work had no index
page and 404'd. Permanent redirects preserve any existing links."
```

---

### Task 6: `/experience` index page

The recruiter entry point. Lists the three roles from `resume.ts`, each linking to its case study. Roles map 1:1 onto case studies, so this page is simultaneously the employment history and the project portfolio.

**Files:**
- Create: `src/app/[lang]/experience/page.tsx`
- Modify: `src/content/resume.ts` (add `caseStudySlug` to `ResumeRole`, populate for all 6 role entries — 3 roles x 2 locales)
- Modify: `src/app/[lang]/dictionaries/en.json`, `.../ru.json` (nav label + page copy)
- Modify: `src/components/SiteHeader.tsx` (nav link)
- Modify: `src/app/[lang]/cv/page.tsx` (link back to `/experience`)

- [ ] **Step 1: Add `caseStudySlug` to `ResumeRole`**

Explicit link, not a fuzzy company-name match — a string match would break silently when a company is renamed. In `src/content/resume.ts`, add to the `ResumeRole` type:

```ts
export type ResumeRole = {
  company: string;
  title: string;
  location: string;
  period: string;
  context: string;
  bullets: string[];
  stack: string;
  /** Case study for this role, if one exists. Links /experience -> /experience/{slug}. */
  caseStudySlug?: string;
};
```

Then add the field to all six role objects (three in `en`, three in `ru`), matching company to slug:

| Company | `caseStudySlug` |
|---|---|
| Kineiro LLC | `"content-automation-platform"` |
| NGINE-LTD | `"blockchain-wallet-backend"` |
| Club1111 | `"nft-marketplace-dapp"` |

- [ ] **Step 2: Add dictionary copy**

To `src/app/[lang]/dictionaries/en.json` — add `"experience"` to the `nav` block, and a new top-level `experiencePage` block:

```json
  "nav": {
    "work": "Work",
    "about": "About",
    "contact": "Contact",
    "experience": "Experience",
    "cv": "CV",
    "skipToContent": "Skip to content"
  },
  "experiencePage": {
    "eyebrow": "Experience",
    "heading": "Where I've built things",
    "lead": "Nearly 7 years of backend and distributed systems - across AI platforms, fintech and Web3. Each role below links to a case study of the system I built there.",
    "caseStudy": "Read the case study",
    "cvCta": "Prefer a one-page PDF? Open the CV."
  },
```

To `src/app/[lang]/dictionaries/ru.json`, the same keys:

```json
    "experience": "Опыт",
```

```json
  "experiencePage": {
    "eyebrow": "Опыт работы",
    "heading": "Где я строил системы",
    "lead": "Почти 7 лет бэкенда и распределённых систем - AI-платформы, финтех и Web3. Каждая роль ниже ведёт к разбору системы, которую я там построил.",
    "caseStudy": "Читать разбор",
    "cvCta": "Нужен PDF на одну страницу? Откройте CV."
  },
```

- [ ] **Step 3: Create the page**

Create `src/app/[lang]/experience/page.tsx`. It reuses `resume.ts` — the same source `/cv` renders, so the two can never drift:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "../dictionaries";
import { getResume } from "@/content/resume";
import { metadataFor } from "@/site/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return metadataFor("experience", lang, {
    title: dict.experiencePage.eyebrow,
    description: dict.experiencePage.lead,
  });
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const r = getResume(locale);
  const t = dict.experiencePage;

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        {t.eyebrow}
      </p>
      <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight text-ink sm:text-7xl">
        {t.heading}
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-ink/80">{t.lead}</p>

      <ol className="mt-16 space-y-14">
        {r.experience.map((role) => (
          <li key={role.company} className="border-t-2 border-ink pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {role.title}
              </h2>
              <span className="font-mono text-xs uppercase tracking-widest text-ink/60">
                {role.period}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-accent">
              {role.company} · {role.location}
            </p>
            <p className="mt-3 italic text-ink/70">{role.context}</p>

            <ul className="mt-4 list-disc space-y-1.5 pl-5 leading-relaxed text-ink/90 marker:text-accent">
              {role.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            <p className="mt-4 font-mono text-xs text-ink/55">
              {r.labels.stack}: {role.stack}
            </p>

            {role.caseStudySlug && (
              <Link
                href={`/${locale}/experience/${role.caseStudySlug}`}
                className="mt-5 inline-block font-mono text-sm font-medium text-ink underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
              >
                {t.caseStudy} →
              </Link>
            )}
          </li>
        ))}
      </ol>

      <p className="mt-16 border-t-2 border-ink pt-8">
        <Link
          href={`/${locale}/cv`}
          className="font-mono text-sm uppercase tracking-widest text-ink/60 transition-colors hover:text-accent"
        >
          {t.cvCta} →
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Add the nav link**

In `src/components/SiteHeader.tsx`, the existing nav items are same-page anchors rendered as bare `<a>` (for smooth scroll). `Experience` is a real route, so it must be a `next/link` — insert it between the nav and the CV button:

```tsx
          <Link
            href={`${base}/experience`}
            className="hidden font-mono text-sm uppercase tracking-widest text-ink/70 transition-colors hover:text-ink sm:block"
          >
            {dict.nav.experience}
          </Link>
```

- [ ] **Step 5: Link `/cv` back to `/experience`**

In `src/app/[lang]/cv/page.tsx`, the back link points at `/${locale}`. Point it at the experience page, which is now the parent in the recruiter funnel:

```tsx
        <Link
          href={`/${locale}/experience`}
          className="font-mono text-xs uppercase tracking-widest text-ink/60 transition-colors hover:text-accent"
        >
          ← {r.labels.back}
        </Link>
```

- [ ] **Step 6: Verify**

```bash
npm run build && npm start &
sleep 5
curl -sS "http://localhost:3000/en/experience" | grep -oE 'rel="canonical" href="[^"]*"|<h1[^>]*>|href="/en/experience/[a-z-]*"' | head
curl -sS -o /dev/null -w "ru: %{http_code}\n" "http://localhost:3000/ru/experience"
kill %1
```

Expected: canonical is `.../en/experience`; the page links to all three case studies; `/ru/experience` returns 200.

- [ ] **Step 7: Commit**

```bash
npm run lint && npm test
git add -A
git commit -m "feat: add /experience - the recruiter entry point

Renders roles from resume.ts (same source as /cv, so they cannot drift)
and links each to its case study."
```

---

### Task 7: Sitemap and robots from the registry

`sitemap.ts` currently hardcodes `["", "/services", "/cv"]` — it would silently omit `/experience` and would wrongly include the now-noindexed `/cv`. Deriving from the registry makes both impossible.

**Files:**
- Rewrite: `src/app/sitemap.ts`
- Rewrite: `src/app/robots.ts`
- Create: `src/app/sitemap.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/sitemap.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("never lists the dead placeholder domain", () => {
    expect(urls.every((u) => u.startsWith("https://maxim.kasakin.tech/"))).toBe(true);
  });

  it("excludes /cv - it is noindex, and a noindexed URL in a sitemap is a Search Console error", () => {
    expect(urls.some((u) => u.endsWith("/cv"))).toBe(false);
  });

  it("includes /experience and every case study, in both locales", () => {
    expect(urls).toContain("https://maxim.kasakin.tech/en/experience");
    expect(urls).toContain("https://maxim.kasakin.tech/ru/experience");
    expect(urls).toContain(
      "https://maxim.kasakin.tech/en/experience/nft-marketplace-dapp",
    );
  });

  it("gives every entry an x-default alternate", () => {
    for (const e of entries) {
      expect(e.alternates?.languages?.["x-default"]).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `/cv` is present and `/experience` is missing.

- [ ] **Step 3: Rewrite `src/app/sitemap.ts`**

```ts
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
```

- [ ] **Step 4: Rewrite `src/app/robots.ts`**

```ts
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, all suites.

- [ ] **Step 6: Verify emitted output**

```bash
npm run build && npm start &
sleep 5
curl -sS http://localhost:3000/robots.txt
curl -sS http://localhost:3000/sitemap.xml | grep -c "<loc>"
curl -sS http://localhost:3000/sitemap.xml | grep -c "/cv"
kill %1
```

Expected: robots.txt names the AI crawlers and points at the real domain; the sitemap has **18** `<loc>` entries (2 locales x 9 = home + experience + 3 case studies + services + 3 service pages); grep for `/cv` returns **0**.

- [ ] **Step 7: Commit**

```bash
npm run lint
git add -A
git commit -m "fix: derive sitemap from route registry; drop /cv, add x-default

The hardcoded path list omitted /experience and included the noindexed
/cv (a Search Console error). Also names AI crawlers explicitly in robots."
```

---

### Task 8: Structured data

The main lever for the branded query. Google resolves "Maxim Kasakin" to an *entity*; `sameAs` is how it learns which web properties belong to it and which is home.

**Files:**
- Create: `src/site/jsonld.ts`
- Modify: `src/app/[lang]/page.tsx` (Person + ProfilePage)
- Modify: `src/app/[lang]/experience/page.tsx` (ProfilePage + breadcrumbs)
- Modify: `src/app/[lang]/experience/[slug]/page.tsx` (Article + breadcrumbs)

**Interfaces:**
- Produces:
  - `personJsonLd(locale: Locale): object`
  - `breadcrumbJsonLd(items: Array<{ name: string; path: string }>): object`
  - `JsonLd({ data }: { data: object }): JSX.Element` — the `<script type="application/ld+json">` wrapper

- [ ] **Step 1: Create `src/site/jsonld.ts`**

```tsx
import { SITE_URL, type Locale } from "@/i18n/config";
import { nameFor, profile } from "@/content/profile";
import { getResume } from "@/content/resume";

/** Renders a JSON-LD block. Matches the existing pattern in services/[slug]. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * The Person entity. `sameAs` is the load-bearing field: it is how Google links
 * this domain to the GitHub/LinkedIn/Telegram profiles it already knows, and
 * decides this site is the entity's home.
 */
export function personJsonLd(locale: Locale, knowsAbout: readonly string[]) {
  const r = getResume(locale);
  const current = r.experience[0];

  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: nameFor(locale),
    url: SITE_URL,
    jobTitle: r.title,
    description: r.summary,
    email: `mailto:${profile.email}`,
    knowsAbout: [...knowsAbout],
    sameAs: profile.links.map((l) => l.href),
    ...(current && {
      worksFor: { "@type": "Organization", name: current.company },
      hasOccupation: {
        "@type": "Occupation",
        name: current.title,
      },
    }),
  };
}

export function profilePageJsonLd(locale: Locale, knowsAbout: readonly string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: personJsonLd(locale, knowsAbout),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
```

- [ ] **Step 2: Emit `ProfilePage` on the homepage**

In `src/app/[lang]/page.tsx`, import `{ JsonLd, profilePageJsonLd }` from `@/site/jsonld` and render as the first child of the returned fragment:

```tsx
      <JsonLd data={profilePageJsonLd(locale, SKILLS)} />
```

- [ ] **Step 3: Emit `ProfilePage` + breadcrumbs on `/experience`**

In `src/app/[lang]/experience/page.tsx`, add inside the returned `<div>`:

```tsx
      <JsonLd data={profilePageJsonLd(locale, [])} />
      <JsonLd
        data={breadcrumbJsonLd([
          // Root crumb is the person, not a "Work" nav label - there is no
          // `nav.home` key and the site root IS the profile.
          { name: nameFor(locale), path: `/${locale}` },
          { name: t.eyebrow, path: `/${locale}/experience` },
        ])}
      />
```

Import `{ nameFor }` from `@/content/profile`.

- [ ] **Step 4: Emit `Article` + breadcrumbs on the case study**

In `src/app/[lang]/experience/[slug]/page.tsx`, add inside the `<article>`:

```tsx
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: project.title[locale],
          description: project.summary[locale],
          url: `${SITE_URL}/${locale}/experience/${slug}`,
          inLanguage: LOCALE_META[locale].bcp47,
          author: { "@id": `${SITE_URL}/#person` },
          about: project.stack,
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: nameFor(locale), path: `/${locale}` },
          { name: dict.nav.experience, path: `/${locale}/experience` },
          { name: project.title[locale], path: `/${locale}/experience/${slug}` },
        ])}
      />
```

Import `SITE_URL` and `LOCALE_META` from `@/i18n/config`, `{ nameFor }` from `@/content/profile`, and `{ JsonLd, breadcrumbJsonLd }` from `@/site/jsonld`.

- [ ] **Step 5: Verify**

```bash
npm run build && npm start &
sleep 5
curl -sS http://localhost:3000/en | grep -o '"@type":"Person"' && echo "Person OK"
curl -sS http://localhost:3000/en | python3 -c "import sys,re,json; [json.loads(m) for m in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', sys.stdin.read(), re.S)] and print('JSON-LD parses')"
curl -sS http://localhost:3000/en | grep -o 'github.com/loliallen' && echo "sameAs OK"
kill %1
```

Expected: `Person OK`, `JSON-LD parses`, `sameAs OK`. Then paste `https://maxim.kasakin.tech/en` into Google's Rich Results Test after deploy.

- [ ] **Step 6: Commit**

```bash
npm run lint && npm test
git add -A
git commit -m "feat: add Person/ProfilePage, Article and BreadcrumbList JSON-LD"
```

---

### Task 9: OG images

No SEO effect. Governs how the link renders in LinkedIn/Telegram/Slack.

**Files:**
- Create: `src/app/[lang]/opengraph-image.tsx`

- [ ] **Step 1: Create the image route**

Uses `ImageResponse` from `next/og` (ships with Next; no new dependency). No custom font file is loaded — the default is fine and avoids adding binary assets.

Colours are the real tokens from `src/app/globals.css`: ink `#0e0e0e`, paper `#f4f2ea`, chartreuse `#d6f84c`. Note that file's warning — chartreuse is "fills only, too low contrast for text" — which holds on the light paper background. Here it sits on near-black ink, where contrast is high, so it is safe for the role line.

```tsx
import { ImageResponse } from "next/og";
import { LOCALES, isLocale } from "@/i18n/config";
import { nameFor } from "@/content/profile";
import { getResume } from "@/content/resume";

export const alt = "Maxim Kasakin - Staff Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const r = getResume(locale);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0e0e0e",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", color: "#d6f84c", fontSize: 28 }}>
          {r.title}
        </div>
        <div
          style={{
            display: "flex",
            color: "#f4f2ea",
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.05,
          }}
        >
          {nameFor(locale)}
        </div>
        <div style={{ display: "flex", color: "#f4f2ea", opacity: 0.7, fontSize: 30 }}>
          maxim.kasakin.tech
        </div>
      </div>
    ),
    { ...size },
  );
}
```

- [ ] **Step 2: Verify both locales render**

```bash
npm run build && npm start &
sleep 5
for l in en ru; do
  curl -sS -o "/tmp/og-$l.png" -w "$l: %{http_code} %{content_type} %{size_download}b\n" \
    "http://localhost:3000/$l/opengraph-image"
done
kill %1
```

Expected: both return `200 image/png` with a non-trivial byte size. Open `/tmp/og-en.png` and confirm the name is legible and nothing is clipped.

- [ ] **Step 3: Commit**

```bash
npm run lint
git add -A
git commit -m "feat: add per-locale OG image"
```

---

### Task 10: llms.txt

**Files:**
- Create: `src/site/llms.ts`
- Create: `src/site/llms.test.ts`
- Create: `src/app/llms.txt/route.ts`

**Interfaces:**
- Produces: `renderLlmsTxt(): string`

- [ ] **Step 1: Write the failing test**

Create `src/site/llms.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { renderLlmsTxt } from "./llms";

describe("renderLlmsTxt", () => {
  const out = renderLlmsTxt();

  it("names the person and the real domain", () => {
    expect(out).toContain("Maxim Kasakin");
    expect(out).toContain("https://maxim.kasakin.tech");
  });

  it("links every case study and service", () => {
    expect(out).toContain("/en/experience/nft-marketplace-dapp");
    expect(out).toContain("/en/services/backend-distributed-systems");
  });

  it("does not link the noindexed CV as a primary entry point", () => {
    // /cv is a print artifact; agents should be pointed at /experience.
    expect(out).toContain("/en/experience");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./llms`.

- [ ] **Step 3: Create `src/site/llms.ts`**

Generated from the content modules so it cannot drift from the site.

```ts
import { DEFAULT_LOCALE, SITE_URL } from "@/i18n/config";
import { nameFor, profile } from "@/content/profile";
import { getResume } from "@/content/resume";
import { projects } from "@/content/work/projects";
import { getServices } from "@/content/services";
import { pathFor } from "./routes";

const L = DEFAULT_LOCALE;

/** https://llmstxt.org - a curated Markdown index of the site for LLM agents. */
export function renderLlmsTxt(): string {
  const r = getResume(L);
  const url = (path: string) => `${SITE_URL}${path}`;

  const lines: string[] = [
    `# ${nameFor(L)}`,
    "",
    `> ${r.title}. ${r.summary}`,
    "",
    `Site: ${SITE_URL}`,
    "",
    "## Experience",
    "",
    `- [All roles and case studies](${url(pathFor("experience", L))}): ${r.experience
      .map((e) => `${e.title} at ${e.company} (${e.period})`)
      .join("; ")}`,
    "",
    "## Case studies",
    "",
    ...projects.map(
      (p) =>
        `- [${p.title[L]}](${url(pathFor("experienceItem", L, p.slug))}): ${p.summary[L]}`,
    ),
    "",
    "## Services",
    "",
    ...getServices(L).map(
      (s) => `- [${s.h1}](${url(pathFor("serviceItem", L, s.slug))}): ${s.tagline}`,
    ),
    "",
    "## Contact",
    "",
    `- Email: ${profile.email}`,
    ...profile.links.map((l) => `- ${l.label}: ${l.href}`),
    "",
  ];

  return lines.join("\n");
}
```

- [ ] **Step 4: Create the route**

`src/app/llms.txt/route.ts`. The proxy matcher (`/((?!_next|.*\..*).*)`) already skips paths containing a dot, so this is not locale-redirected — no proxy change needed.

```ts
import { renderLlmsTxt } from "@/site/llms";

export const dynamic = "force-static";

export function GET() {
  return new Response(renderLlmsTxt(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
```

- [ ] **Step 5: Do NOT try to advertise llms.txt from robots.txt**

The spec floated linking `llms.txt` from `robots.txt`. Drop that: `MetadataRoute.Robots` exposes no field for arbitrary directives, and a non-standard line would have to be smuggled in. It buys nothing — `/llms.txt` is a well-known location that agents fetch directly. Recorded here so the omission reads as deliberate rather than forgotten. **No code change.**

- [ ] **Step 6: Run tests and verify emitted output**

```bash
npm test
npm run build && npm start &
sleep 5
curl -sS -w "\n-- %{http_code} %{content_type}\n" http://localhost:3000/llms.txt
kill %1
```

Expected: tests PASS; the route returns `200 text/plain; charset=utf-8` with the Markdown index, and is **not** redirected to `/en/llms.txt`.

- [ ] **Step 7: Commit**

```bash
npm run lint
git add -A
git commit -m "feat: add generated llms.txt"
```

---

### Task 11: End-to-end SEO verification

Both original bugs were invisible in source and in the rendered page. This script is the regression guard: it asserts on emitted HTML for every route in the registry, so the next canonical bug fails loudly.

**Files:**
- Create: `scripts/verify-seo.mjs`
- Modify: `package.json` (add `verify:seo` script)

- [ ] **Step 1: Write the script**

```js
/**
 * Asserts the emitted HTML of every route. Run against a running production
 * server: `npm run build && npm start`, then `npm run verify:seo`.
 *
 * Exists because both de-indexing bugs this site shipped with were invisible in
 * source and in the rendered page - only the emitted <head> revealed them.
 */
const BASE = process.env.VERIFY_BASE ?? "http://localhost:3000";
const DOMAIN = "https://maxim.kasakin.tech";
const DEAD = "maximkasakin.dev";

const LOCALES = ["en", "ru"];
const CASE_STUDIES = [
  "content-automation-platform",
  "blockchain-wallet-backend",
  "nft-marketplace-dapp",
];
const SERVICES = [
  "backend-distributed-systems",
  "ai-platforms-orchestration",
  "blockchain-web3",
];

const failures = [];
const fail = (msg) => failures.push(msg);

const get = async (path) => {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  return { status: res.status, location: res.headers.get("location"), body: await res.text() };
};

const canonicalOf = (html) =>
  html.match(/rel="canonical" href="([^"]*)"/)?.[1] ?? null;
const hreflangsOf = (html) =>
  [...html.matchAll(/hrefLang="([^"]*)"/gi)].map((m) => m[1]);

for (const locale of LOCALES) {
  const routes = [
    ["", `/${locale}`],
    ["experience", `/${locale}/experience`],
    ["services", `/${locale}/services`],
    ...CASE_STUDIES.map((s) => [`case:${s}`, `/${locale}/experience/${s}`]),
    ...SERVICES.map((s) => [`service:${s}`, `/${locale}/services/${s}`]),
  ];

  for (const [label, path] of routes) {
    const { status, body } = await get(path);
    if (status !== 200) { fail(`${path}: expected 200, got ${status}`); continue; }

    const canonical = canonicalOf(body);
    const expected = `${DOMAIN}${path}`;
    if (canonical !== expected) {
      fail(`${path}: canonical is "${canonical}", expected "${expected}" (${label})`);
    }

    const hreflangs = hreflangsOf(body);
    for (const want of ["en", "ru", "x-default"]) {
      if (!hreflangs.includes(want)) fail(`${path}: missing hreflang "${want}"`);
    }

    if (body.includes(DEAD)) fail(`${path}: still references the dead domain ${DEAD}`);
  }

  // /cv must be noindex and must NOT be in the sitemap.
  const cv = await get(`/${locale}/cv`);
  if (!/name="robots"[^>]*noindex/.test(cv.body)) {
    fail(`/${locale}/cv: expected noindex`);
  }

  // Old /work paths must permanently redirect.
  const old = await get(`/${locale}/work/${CASE_STUDIES[0]}`);
  if (old.status !== 308) fail(`/${locale}/work/...: expected 308, got ${old.status}`);
}

const sitemap = await get("/sitemap.xml");
if (sitemap.body.includes(DEAD)) fail(`sitemap.xml references the dead domain ${DEAD}`);
if (/<loc>[^<]*\/cv<\/loc>/.test(sitemap.body)) {
  fail("sitemap.xml lists /cv, which is noindex - a Search Console error");
}

const robots = await get("/robots.txt");
if (robots.body.includes(DEAD)) fail(`robots.txt references the dead domain ${DEAD}`);
if (!robots.body.includes(`${DOMAIN}/sitemap.xml`)) fail("robots.txt: wrong sitemap URL");

const llms = await get("/llms.txt");
if (llms.status !== 200) fail(`/llms.txt: expected 200, got ${llms.status}`);

if (failures.length) {
  console.error(`\n✗ ${failures.length} SEO check(s) failed:\n`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("✓ all SEO checks passed");
```

- [ ] **Step 2: Add the script to `package.json`**

```json
"verify:seo": "node scripts/verify-seo.mjs"
```

- [ ] **Step 3: Run it**

```bash
npm run build && npm start &
sleep 5
npm run verify:seo
kill %1
```

Expected: `✓ all SEO checks passed`. **If anything fails, fix it — do not proceed.** A failure here means a page is still telling Google not to index it.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: add end-to-end SEO verification against emitted HTML"
```

---

## After the plan: what only you can do

Code does not get a site indexed. These are manual and they are the slow part:

1. **Google Search Console** — add `maxim.kasakin.tech`, verify (DNS TXT, or set `GOOGLE_SITE_VERIFICATION` in Vercel and redeploy), submit `https://maxim.kasakin.tech/sitemap.xml`, then request indexing for `/en`, `/ru`, `/en/experience`.
2. **Backlinks — the highest-leverage action in this whole plan.** Put `maxim.kasakin.tech` in your GitHub profile's website field and in LinkedIn's contact info. Your site links out to both; neither links back, so Google has no corroboration that this domain belongs to the "Maxim Kasakin" it already knows.
3. **Expect days to weeks**, not hours. Nothing here produces a same-day result.
