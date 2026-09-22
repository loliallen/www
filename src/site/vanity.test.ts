import { describe, expect, it } from "vitest";
import { vanityRedirect } from "./vanity";

describe("vanityRedirect", () => {
  it("sends the bare vanity host to the blog index", () => {
    expect(vanityRedirect("blog.kasakin.tech", "/")).toBe(
      "https://maxim.kasakin.tech/ru/blog",
    );
  });

  it("keeps the path, so a shared post link still lands on that post", () => {
    expect(vanityRedirect("blog.kasakin.tech", "/hotlinetrade-dayz-portal")).toBe(
      "https://maxim.kasakin.tech/ru/blog/hotlinetrade-dayz-portal",
    );
  });

  it("ignores the port and the case of the host header", () => {
    expect(vanityRedirect("BLOG.kasakin.tech:443", "/")).toBe(
      "https://maxim.kasakin.tech/ru/blog",
    );
  });

  it("leaves every other host alone", () => {
    expect(vanityRedirect("maxim.kasakin.tech", "/ru/blog")).toBeNull();
    expect(vanityRedirect(null, "/")).toBeNull();
  });
});
