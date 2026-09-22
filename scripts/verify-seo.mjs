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

const POSTS = [["hotlinetrade-dayz-portal", "ru"]];
const BLOG_LOCALES = ["ru"];

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

const sitemap = await get("/sitemap.xml");
const sitemapHas = (url) => sitemap.body.includes(`<loc>${url}</loc>`);

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

    if (!body.includes(`${DOMAIN}/${locale}/opengraph-image`)) {
      fail(`${path}: missing the ${locale} og:image - the link card would be blank`);
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

// The blog index exists only where posts do, and its feed must be valid.
for (const locale of BLOG_LOCALES) {
  const index = await get(`/${locale}/blog`);
  if (index.status !== 200) fail(`/${locale}/blog: expected 200, got ${index.status}`);
  if (!index.body.includes(`/${locale}/blog/feed.xml`)) {
    fail(`/${locale}/blog: does not advertise its RSS feed`);
  }
  if (!sitemapHas(`${DOMAIN}/${locale}/blog`)) fail(`sitemap.xml is missing /${locale}/blog`);

  const feed = await get(`/${locale}/blog/feed.xml`);
  if (feed.status !== 200) fail(`/${locale}/blog/feed.xml: expected 200, got ${feed.status}`);
  if (!feed.body.startsWith("<?xml")) fail(`/${locale}/blog/feed.xml: not XML`);
  if (feed.body.includes("localhost")) {
    fail(`/${locale}/blog/feed.xml: links point at localhost, not the production domain`);
  }
}

for (const locale of LOCALES.filter((l) => !BLOG_LOCALES.includes(l))) {
  const empty = await get(`/${locale}/blog`);
  if (empty.status !== 404) {
    fail(`/${locale}/blog: expected 404 (no posts in that language), got ${empty.status}`);
  }
}

// Posts are published in one language only. The other locale's URL must not
// exist, and the published one must not advertise it in hreflang.
for (const [slug, locale] of POSTS) {
  const path = `/${locale}/blog/${slug}`;
  const { status, body } = await get(path);

  if (status !== 200) {
    fail(`${path}: expected 200, got ${status}`);
  } else {
    const canonical = canonicalOf(body);
    if (canonical !== `${DOMAIN}${path}`) {
      fail(`${path}: canonical is "${canonical}", expected "${DOMAIN}${path}"`);
    }

    const hreflangs = hreflangsOf(body);
    for (const want of [locale, "x-default"]) {
      if (!hreflangs.includes(want)) fail(`${path}: missing hreflang "${want}"`);
    }
    for (const other of LOCALES.filter((l) => l !== locale)) {
      if (hreflangs.includes(other)) {
        fail(`${path}: advertises hreflang "${other}", but that page does not exist`);
      }
    }

    if (!body.includes(`${DOMAIN}/${locale}/opengraph-image`)) {
      fail(`${path}: missing the ${locale} og:image - the link card would be blank`);
    }
  }

  for (const other of LOCALES.filter((l) => l !== locale)) {
    const missing = await get(`/${other}/blog/${slug}`);
    if (missing.status !== 404) {
      fail(`/${other}/blog/${slug}: expected 404, got ${missing.status}`);
    }
  }

  if (!sitemapHas(`${DOMAIN}${path}`)) fail(`sitemap.xml is missing ${path}`);
}

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
