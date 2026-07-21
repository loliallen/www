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
