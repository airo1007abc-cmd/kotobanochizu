import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build, loadEnv } from "vite";

const env = loadEnv("production", process.cwd(), "");
const configured = (process.env.SITE_URL || env.SITE_URL || "").trim();
let origin = "";
if (configured) {
  const parsed = new URL(configured);
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    parsed.pathname !== "/"
  )
    throw new Error(
      "SITE_URL must be an HTTPS origin without path, query or credentials",
    );
  origin = parsed.origin;
}
const template = await readFile("dist/index.html", "utf8");
await build({
  configFile: false,
  mode: "production",
  logLevel: "warn",
  build: {
    ssr: "src/prerender.tsx",
    outDir: "tmp/prerender",
    emptyOutDir: true,
    minify: false,
  },
  define: { "import.meta.env.DEV": "false", "import.meta.env.PROD": "true" },
});
const {
  allPageMetadata,
  getPageMetadata,
  redirects,
  structuredData,
  renderPage,
} = await import(
  pathToFileURL(resolve("tmp/prerender/prerender.js")).href + "?v=" + Date.now()
);
const escape = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const json = (v) => JSON.stringify(v).replaceAll("<", "\\u003c");
const render = async (page) => {
  const url = origin + encodeURI(page.path);
  let html = template
    .replace(
      '<html lang="ja">',
      `<html lang="ja" data-site-origin="${escape(origin)}">`,
    )
    .replace(/<title>.*?<\/title>/s, `<title>${escape(page.title)}</title>`)
    .replace(
      /(<meta\s+(?:name="description"|property="og:description")\s+content=")[^"]*("\s*\/?>)/gs,
      `$1${escape(page.description)}$2`,
    )
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/?>)/gs,
      `$1${escape(page.title)}$2`,
    )
    .replace(
      "</head>",
      `${origin ? `<link rel="canonical" href="${escape(url)}" /><meta property="og:url" content="${escape(url)}" />` : ""}<meta name="robots" content="${page.indexable ? "index" : "noindex"},follow" /><script id="page-schema" type="application/ld+json">${json(structuredData(page, origin))}</script></head>`,
    );
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${await renderPage(page.path)}</div>`,
  );
  if (page.path === "/prefectures" || /^\/(prefectures|regions|dialects)\//.test(page.path)) {
    html = html.replace("</head>", '<link rel="preload" href="/japan-prefectures.svg" as="fetch" crossorigin="anonymous" /></head>');
  }
  return html;
};
for (const [i, page] of allPageMetadata.entries()) {
  const dir = join("dist", page.path.slice(1));
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), await render(page));
  if ((i + 1) % 500 === 0)
    console.log(`Rendered ${i + 1}/${allPageMetadata.length}`);
}
await writeFile("dist/404.html", await render(getPageMetadata("/404")));
for (const [from, to] of Object.entries(redirects)) {
  const dir = join("dist", from.slice(1));
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, "index.html"),
    `<!doctype html><html lang="ja"><head><meta charset="utf-8"/><title>移転したことば｜ことばの地図</title><meta name="description" content="この使用例は出典付き記録へ移転しました。" /><meta name="robots" content="noindex,follow" /><link rel="canonical" href="${origin}${to}" /><meta property="og:url" content="${origin}${to}" /><meta http-equiv="refresh" content="0;url=${to}" /><script type="application/ld+json">${json(structuredData(getPageMetadata(to), origin))}</script></head><body><h1>出典付きの記録へ移転しました</h1><a href="${to}">ことばを見る</a></body></html>`,
  );
}
const sitemapPages = allPageMetadata.filter((p) => p.indexable);
if (origin) {
  const chunks = [];
  for (let i = 0; i < sitemapPages.length; i += 500)
    chunks.push(sitemapPages.slice(i, i + 500));
  for (const [i, chunk] of chunks.entries())
    await writeFile(
      `dist/sitemap-${i + 1}.xml`,
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${chunk.map((p) => `<url><loc>${escape(origin + encodeURI(p.path))}</loc></url>`).join("")}</urlset>`,
    );
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${chunks.map((_, i) => `<sitemap><loc>${origin}/sitemap-${i + 1}.xml</loc></sitemap>`).join("")}</sitemapindex>`,
  );
}
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ""}`,
);
await mkdir("tmp/site-audit", { recursive: true });
await writeFile(
  "tmp/site-audit/route-decisions.json",
  JSON.stringify(allPageMetadata, null, 2),
);
console.log(
  `Generated ${allPageMetadata.length} complete pages, ${Object.keys(redirects).length} redirects; ${sitemapPages.length} indexable.`,
);
