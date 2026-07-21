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
