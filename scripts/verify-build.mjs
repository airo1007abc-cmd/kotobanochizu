import { access, readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? walk(join(dir, entry.name))
          : Promise.resolve([join(dir, entry.name)]),
      ),
    )
  ).flat();
};

const files = await walk(dist);
const htmlFiles = files.filter((file) => file.endsWith("index.html"));
const failures = [];
const siteOrigin = process.env.SITE_URL?.replace(/\/$/, "");
if (htmlFiles.length < 300)
  failures.push(`static route entries: ${htmlFiles.length}/300以上`);

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const label = relative(dist, file);
  if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`${label}: titleなし`);
  if (!/<meta\s+name="description"\s+content="[^"]+"\s*\/>/s.test(html))
    failures.push(`${label}: descriptionなし`);
  if (/\b(undefined|null)\b/.test(html))
    failures.push(`${label}: 未定義値を含む`);
  if (!/<meta\s+name="robots"\s+content="(?:index|noindex),follow"\s*\/>/s.test(html))
    failures.push(`${label}: SEO公開判定なし`);
  if (!html.includes('"@type":"BreadcrumbList"'))
    failures.push(`${label}: BreadcrumbListなし`);
  if (siteOrigin && !html.includes(`<meta property="og:url" content="${siteOrigin}`))
    failures.push(`${label}: production og:urlなし`);
  if (siteOrigin && !html.includes(`<link rel="canonical" href="${siteOrigin}`))
    failures.push(`${label}: production canonicalなし`);
}

const required = [
  "index.html",
  "prefectures/p1/index.html",
  "prefectures/p47/index.html",
  "regions/r1/index.html",
  "regions/jp-47-region-八重山諸島/index.html",
  "dialects/d1/index.html",
  "dialects/d23/index.html",
  "conversations/c1/index.html",
  "conversations/c8/index.html",
  "corrections/index.html",
  "manifest.webmanifest",
  "robots.txt",
  "icon.svg",
];
for (const path of required) {
  await access(join(dist, ...path.split("/"))).catch(() =>
    failures.push(`${path}: 生成されていません`),
  );
}

console.log(
  JSON.stringify(
    {
      status: failures.length ? "FAILED" : "PASSED",
      staticRouteEntries: htmlFiles.length,
      requiredArtifacts: required.length,
      failures,
    },
    null,
    2,
  ),
);
if (failures.length) process.exitCode = 1;
