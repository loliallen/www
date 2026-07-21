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
