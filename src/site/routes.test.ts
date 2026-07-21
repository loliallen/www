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
