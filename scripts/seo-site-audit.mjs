import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const walk = async (dir) => (await Promise.all((await readdir(dir, { withFileTypes: true })).map((entry) => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]))).flat();
const files = (await walk(dist)).filter((file) => file.endsWith("index.html"));
const pages = await Promise.all(files.map(async (file) => {
  const html = await readFile(file, "utf8");
  const path = `/${relative(dist, file).replaceAll("\\", "/").replace(/\/?index\.html$/, "")}`.replace(/\/$/, "") || "/";
  return {
    path,
    title: html.match(/<title>(.*?)<\/title>/s)?.[1] ?? "",
    description: html.match(/<meta\s+name="description"\s+content="([^"]*)"/s)?.[1] ?? "",
    robots: html.match(/<meta\s+name="robots"\s+content="([^"]*)"/s)?.[1] ?? "",
    hrefs: [...html.matchAll(/href="(\/[^"#?]*)/g)].map((match) => match[1].replace(/\/$/, "") || "/"),
  };
}));
const duplicates = (field) => [...Map.groupBy(pages, (page) => page[field]).entries()]
  .filter(([value, group]) => value && group.length > 1)
  .map(([value, group]) => ({
    value,
    paths: group.map((page) => page.path),
    indexablePaths: group.filter((page) => page.robots.startsWith("index,")).map((page) => page.path),
  }));
const paths = new Set(pages.map((page) => page.path));
const linked = new Set(pages.flatMap((page) => page.hrefs));
const brokenLinks = [...linked].filter((href) => !paths.has(href) && !href.match(/\.[a-z]+$/i));
const underlinkedIndexablePages = pages
  .filter((page) => page.path.startsWith("/dialects/") && page.robots.startsWith("index,"))
  .filter((page) => new Set(page.hrefs.filter((href) => href !== page.path && paths.has(href))).size < 2)
  .map((page) => page.path);
const report = {
  generatedAt: new Date().toISOString(),
  totalStaticPages: pages.length,
  indexable: pages.filter((page) => page.robots.startsWith("index,")).length,
  noindex: pages.filter((page) => page.robots.startsWith("noindex,")).length,
  missingRobotsDecision: pages.filter((page) => !page.robots).length,
  duplicateTitles: duplicates("title"),
  duplicateDescriptions: duplicates("description"),
  brokenInternalLinks: brokenLinks,
  orphanStaticPages: pages.filter((page) => page.path !== "/" && !linked.has(page.path)).map((page) => page.path),
  underlinkedIndexablePages,
};
const blockingDuplicateTitles = report.duplicateTitles.filter((group) => group.indexablePaths.length > 1);
const blockingDuplicateDescriptions = report.duplicateDescriptions.filter((group) => group.indexablePaths.length > 1);
report.blockingDuplicateTitles = blockingDuplicateTitles;
report.blockingDuplicateDescriptions = blockingDuplicateDescriptions;
console.log(JSON.stringify(report, null, 2));
await mkdir(join(root, "reports"), { recursive: true });
await writeFile(join(root, "reports/seo-site-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
if (
  report.missingRobotsDecision ||
  blockingDuplicateTitles.length ||
  blockingDuplicateDescriptions.length ||
  report.brokenInternalLinks.length ||
  report.orphanStaticPages.length ||
  report.underlinkedIndexablePages.length
) process.exitCode = 1;
