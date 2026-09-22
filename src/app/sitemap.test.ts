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

describe("sitemap on locale-restricted routes", () => {
  const entries = sitemap();

  it("lists the Russian blog and not an English one that does not exist", () => {
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://maxim.kasakin.tech/ru/blog");
    expect(urls).toContain(
      "https://maxim.kasakin.tech/ru/blog/hotlinetrade-dayz-portal",
    );
    expect(urls.some((u) => u.includes("/en/blog"))).toBe(false);
  });

  it("does not advertise an English alternate for it", () => {
    const post = entries.find((e) => e.url.includes("/blog/"));
    expect(post?.alternates?.languages?.en).toBeUndefined();
    expect(post?.alternates?.languages?.["x-default"]).toBe(
      "https://maxim.kasakin.tech/ru/blog/hotlinetrade-dayz-portal",
    );
  });
});
