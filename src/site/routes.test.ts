import { describe, expect, it } from "vitest";
import {
  ROUTES,
  pathFor,
  indexableEntries,
  localesFor,
  type RouteKey,
} from "./routes";
import { localesForPath } from "./locale-scope";
import { LOCALES } from "@/i18n/config";

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

describe("locale-restricted routes", () => {
  it("defaults to every locale when a route names none", () => {
    expect(localesFor("experience")).toEqual([...LOCALES]);
  });

  it("honours the locales a route does name", () => {
    // The HotlineTrade post addresses Russian-speaking server owners; an
    // English copy would be a page with no audience, so the route has none.
    expect(localesFor("blogPost")).toEqual(["ru"]);
  });

  it("publishes the blog index only where posts exist", () => {
    // An index in a locale with nothing in it is a thin page competing for
    // nothing, so it must not be generated or listed at all.
    expect(localesFor("blog")).toEqual(["ru"]);
  });

  it("never yields a sitemap entry in a locale the route does not serve", () => {
    const blog = indexableEntries().filter(
      (e) => e.key === "blog" || e.key === "blogPost",
    );
    expect(blog.length).toBeGreaterThan(0);
    expect(blog.every((e) => e.locale === "ru")).toBe(true);
  });
});

describe("localesForPath", () => {
  it("agrees with the registry on every route, locale and slug", () => {
    // The language switcher is a client component and cannot import the
    // registry without dragging every project and service into the bundle.
    // It reads this function instead, so the two must not drift apart.
    for (const key of Object.keys(ROUTES) as RouteKey[]) {
      const slugs = ROUTES[key].params ? ROUTES[key].params!() : [undefined];
      for (const slug of slugs) {
        for (const locale of localesFor(key, slug)) {
          expect(localesForPath(pathFor(key, locale, slug))).toEqual(
            localesFor(key, slug),
          );
        }
      }
    }
  });

  it("falls back to every locale on an unknown path", () => {
    expect(localesForPath("/ru/nothing-here")).toEqual([...LOCALES]);
  });
});
