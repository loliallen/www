import { describe, expect, it } from "vitest";
import { renderFeed, rfc822 } from "./rss";

const labels = { title: "Блог", description: "Заметки по работе" };

describe("rfc822", () => {
  it("emits RFC 822, which is what RSS 2.0 requires", () => {
    // An ISO date here makes readers drop the item or sort it to the epoch.
    expect(rfc822("2026-09-22")).toBe("Tue, 22 Sep 2026 00:00:00 GMT");
  });
});

describe("renderFeed", () => {
  const feed = renderFeed("ru", labels);

  it("declares the locale it was rendered for", () => {
    expect(feed).toContain("<language>ru</language>");
  });

  it("links items absolutely, on the production domain", () => {
    expect(feed).toContain(
      "<link>https://maxim.kasakin.tech/ru/blog/hotlinetrade-dayz-portal</link>",
    );
    expect(feed).not.toContain("localhost");
  });

  it("points atom:link at itself, as feed validators require", () => {
    expect(feed).toContain(
      'href="https://maxim.kasakin.tech/ru/blog/feed.xml" rel="self"',
    );
  });

  it("carries only the posts written in that locale", () => {
    const items = feed.match(/<item>/g) ?? [];
    expect(items).toHaveLength(1);
  });

  it("escapes markup that would otherwise break the XML", () => {
    const hostile = renderFeed("ru", {
      title: 'Blog & <friends> "quoted"',
      description: "a < b",
    });
    expect(hostile).toContain(
      "<title>Blog &amp; &lt;friends&gt; &quot;quoted&quot;</title>",
    );
    expect(hostile).toContain("<description>a &lt; b</description>");
  });
});

describe("renderFeed contacts", () => {
  it("names the blog's own inbox, not the hiring one", () => {
    // Game-server enquiries and hiring threads go to different addresses; a
    // feed reader that surfaces managingEditor must show the blog's.
    expect(renderFeed("ru", labels)).toContain(
      "<managingEditor>dayz@kasakin.tech (Максим Касакин)</managingEditor>",
    );
  });
});
