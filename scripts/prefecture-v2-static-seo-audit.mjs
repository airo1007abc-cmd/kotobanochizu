import fs from "node:fs";

const baseline = JSON.parse(fs.readFileSync("reports/prefecture-v2-baseline.json", "utf8"));
const failures = [];
const results = baseline.prefectures.map((prefecture) => {
  const file = `dist/prefectures/${prefecture.prefectureId}/index.html`;
  if (!fs.existsSync(file)) {
    failures.push(`${prefecture.prefectureName}: static HTML missing`);
    return { id: prefecture.prefectureId, name: prefecture.prefectureName, exists: false };
  }
  const html = fs.readFileSync(file, "utf8");
  const row = {
    id: prefecture.prefectureId,
    name: prefecture.prefectureName,
    exists: true,
    title: /<title>[^<]+<\/title>/.test(html),
    description: /<meta\s+name="description"\s+content="[^"]+"/.test(html),
    breadcrumb: html.includes('"@type":"BreadcrumbList"'),
    ogTitle: /<meta\s+property="og:title"\s+content="[^"]+"/.test(html),
    ogDescription: /<meta\s+property="og:description"\s+content="[^"]+"/.test(html),
    canonical: /<link\s+rel="canonical"/.test(html),
    noindex: /<meta\s+name="robots"\s+content="noindex/.test(html),
  };
  for (const key of ["title", "description", "breadcrumb", "ogTitle", "ogDescription"]) {
    if (!row[key]) failures.push(`${prefecture.prefectureName}: ${key} missing`);
  }
  return row;
});
const canonicalCount = results.filter((item) => item.canonical).length;
const output = {
  generatedAt: "2026-09-05",
  status: failures.length ? "FAILED" : "PASSED",
  prefectures: results.length,
  canonicalCount,
  canonicalExpectedWithoutSiteUrl: 0,
  robotsPolicy: "既存仕様を維持（県ページは静的HTMLでnoindex,follow）",
  browserH1Audit: "reports/prefecture-v2-browser-audit.json",
  deploymentBlocker: canonicalCount === 0 ? "本番環境でSITE_URLを設定しcanonical・og:url・sitemapを再確認する" : null,
  failures,
  results,
};
fs.writeFileSync("reports/prefecture-v2-static-seo-audit.json", `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ status: output.status, prefectures: output.prefectures, canonicalCount, failures: failures.length }, null, 2));
if (failures.length) process.exitCode = 1;
