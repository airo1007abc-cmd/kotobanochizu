import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, relative } from "node:path";

const mode = process.argv[2] || "after";
const origin = process.env.AUDIT_ORIGIN;
const redirects = mode.includes("before")
  ? {}
  : Object.fromEntries(
      JSON.parse(await readFile("vercel.json", "utf8")).redirects.map((r) => [
        r.source,
        r.destination,
      ]),
    );
const walk = async (dir) =>
  (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : join(dir, e.name),
      ),
    )
  ).flat();
const files = (await walk("dist")).filter((f) => f.endsWith("index.html"));
const decode = (s) =>
  s
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
const normalize = (s) => {
  try {
    return (
      decodeURIComponent(
        new URL(decode(s), "https://audit.invalid").pathname,
      ).replace(/\/$/, "") || "/"
    );
  } catch {
    return s;
  }
};
const pages = [];
let cursor = 0;
await Promise.all(
  Array.from({ length: origin ? 6 : 1 }, async () => {
    while (cursor < files.length) {
      const file = files[cursor++];
      const path =
        "/" +
        relative("dist", file)
          .replaceAll("\\", "/")
          .replace(/\/?index\.html$/, "");
      let html,
        status = 200,
        location;
      if (origin) {
        try {
          const response = await fetch(
            origin + encodeURI(path === "/" ? path : path.replace(/\/$/, "")),
            { redirect: "manual", signal: AbortSignal.timeout(30000) },
          );
          status = response.status;
          location = response.headers.get("location");
          html = await response.text();
        } catch (error) {
          status = 0;
          html = "";
          location = String(error);
        }
      } else html = await readFile(file, "utf8");
      const meta = (name) =>
        decode(
          html.match(
            new RegExp(
              `<meta\\s+(?:name|property)="${name}"\\s+content="([^"]*)"`,
            ),
          )?.[1] ?? "",
        );
      const json = [
        ...html.matchAll(
          /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
        ),
      ].map((m) => {
        try {
          return JSON.parse(m[1]);
        } catch {
          return { invalid: true };
        }
      });
      pages.push({
        path: normalize(path),
        status,
        location,
        title: decode(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? ""),
        description: meta("description"),
        robots: meta("robots"),
        canonical: decode(
          html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/)?.[1] ?? "",
        ),
        ogUrl: meta("og:url"),
        h1: [...html.matchAll(/<h1[\s>]/g)].length,
        jsonTypes: json.map((j) => j["@type"] || "invalid"),
        breadcrumbLinks: json
          .filter((j) => j["@type"] === "BreadcrumbList")
          .flatMap((j) => j.itemListElement.map((i) => normalize(i.item))),
        links: [
          ...new Set(
            [...html.matchAll(/<a\s[^>]*href="([^"]*)"/g)]
              .map((m) => decode(m[1]))
              .filter((h) => h.startsWith("/") && !h.startsWith("//"))
              .map(normalize),
          ),
        ],
        bytes: Buffer.byteLength(html),
      });
      if (origin && pages.length % 300 === 0)
        console.log(`Audited ${pages.length}/${files.length}`);
    }
  }),
);
pages.sort((a, b) => a.path.localeCompare(b.path));
const paths = new Set(pages.map((p) => p.path));
const linked = new Set(pages.flatMap((p) => p.links));
const duplicates = (field) =>
  [
    ...Map.groupBy(
      pages.filter((p) => p.status === 200),
      (p) => p[field],
    ),
  ]
    .filter(([v, g]) => v && g.length > 1)
    .map(([value, g]) => ({
      value,
      paths: g.map((p) => p.path),
      indexable: g.filter((p) => p.robots.startsWith("index,")).length,
    }));
const sitemapFiles = (await readdir("dist")).filter((f) =>
  /^sitemap-\d+\.xml$/.test(f),
);
const sitemapUrls = [];
for (const file of sitemapFiles) {
  const xml = origin
    ? await (await fetch(origin + "/" + file)).text()
    : await readFile(join("dist", file), "utf8");
  sitemapUrls.push(
    ...[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => decode(m[1])),
  );
}
const indexed = pages.filter(
  (p) => p.robots.startsWith("index,") && p.status === 200,
);
const sitemapPaths = new Set(sitemapUrls.map(normalize));
const summary = {
  total: pages.length,
  indexable: indexed.length,
  noindex: pages.filter((p) => p.robots.startsWith("noindex,")).length,
  sitemap: sitemapUrls.length,
  missingMetadata: pages
    .filter(
      (p) => p.status === 200 && (!p.title || !p.description || !p.robots),
    )
    .map((p) => p.path),
  canonicalErrors: pages
    .filter(
      (p) =>
        p.status === 200 &&
        (!p.canonical ||
          normalize(p.canonical) !== p.path ||
          p.canonical !== p.ogUrl),
    )
    .map((p) => p.path),
  missingH1: pages
    .filter((p) => p.status === 200 && p.h1 !== 1)
    .map((p) => p.path),
  brokenLinks: [...linked].filter(
    (p) => !paths.has(p) && !p.match(/\.[a-z]+$/i),
  ),
  orphans: pages
    .filter((p) => p.path !== "/" && !linked.has(p.path))
    .map((p) => p.path),
  invalidBreadcrumbLinks: [
    ...new Set(
      pages.flatMap((p) => p.breadcrumbLinks).filter((p) => !paths.has(p)),
    ),
  ],
  duplicateTitles: duplicates("title"),
  duplicateDescriptions: duplicates("description"),
  indexedDuplicateMetadata: [
    ...duplicates("title"),
    ...duplicates("description"),
  ].filter((g) => g.indexable > 1),
  invalidSchema: pages
    .filter(
      (p) =>
        p.status === 200 &&
        (!p.jsonTypes.includes("BreadcrumbList") ||
          p.jsonTypes.includes("invalid")) &&
        !redirects[p.path],
    )
    .map((p) => p.path),
  duplicateSitemapUrls: sitemapUrls.filter(
    (url, i) => sitemapUrls.indexOf(url) !== i,
  ),
  sitemapMismatch: [...sitemapPaths].filter(
    (p) => !indexed.some((i) => i.path === p),
  ),
  indexableOutsideSitemap: indexed
    .filter((p) => !sitemapPaths.has(p.path))
    .map((p) => p.path),
  httpFailures: pages
    .filter((p) => p.status !== 200)
    .map(({ path, status, location }) => ({ path, status, location })),
  htmlBytes: pages.reduce((n, p) => n + p.bytes, 0),
};
await mkdir("reports/site-audit", { recursive: true });
summary.canonicalErrors = summary.canonicalErrors.filter(
  (p) =>
    !redirects[p] ||
    normalize(pages.find((page) => page.path === p)?.canonical ?? "") !==
      redirects[p],
);
summary.redirects = pages
  .filter((p) => redirects[p.path])
  .map((p) => ({
    path: p.path,
    status: p.status,
    target: p.location || p.canonical,
  }));
summary.httpFailures = summary.httpFailures.filter(
  (p) =>
    !(p.status === 308 && normalize(p.location || "") === redirects[p.path]),
);
summary.orphans = summary.orphans.filter((p) => !redirects[p]);
await writeFile(
  `reports/site-audit/${mode}.json`,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      origin: origin || "local build",
      summary,
      pages,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    Object.fromEntries(
      Object.entries(summary).map(([k, v]) => [
        k,
        Array.isArray(v) ? v.length : v,
      ]),
    ),
    null,
    2,
  ),
);
if (
  process.argv.includes("--check") &&
  [
    "missingMetadata",
    "canonicalErrors",
    "missingH1",
    "brokenLinks",
    "orphans",
    "invalidBreadcrumbLinks",
    "sitemapMismatch",
    "indexableOutsideSitemap",
    "httpFailures",
    "indexedDuplicateMetadata",
    "invalidSchema",
    "duplicateSitemapUrls",
  ].some((key) => summary[key].length)
)
  process.exitCode = 1;
