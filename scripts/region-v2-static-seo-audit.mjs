import fs from "node:fs";
const baseline = JSON.parse(fs.readFileSync("reports/region-v2-baseline.json", "utf8"));
const failures = [];
const results = baseline.regions.map((region) => {
  const file = `dist/regions/${region.regionId}/index.html`;
  if (!fs.existsSync(file)) { failures.push(`${region.regionId}: missing HTML`); return { id: region.regionId, exists: false }; }
  const html = fs.readFileSync(file, "utf8");
  const item = { id: region.regionId, name: region.regionName, exists: true, title: /<title>[^<]+<\/title>/.test(html), description: /<meta\s+name="description"\s+content="[^"]+"/.test(html), ogTitle: /<meta\s+property="og:title"\s+content="[^"]+"/.test(html), ogDescription: /<meta\s+property="og:description"\s+content="[^"]+"/.test(html), breadcrumb: html.includes('"@type":"BreadcrumbList"'), canonical: /<link\s+rel="canonical"/.test(html), noindex: /<meta\s+name="robots"\s+content="noindex,follow"/.test(html) };
  for (const key of ["title", "description", "ogTitle", "ogDescription", "breadcrumb", "noindex"]) if (!item[key]) failures.push(`${region.regionId}: ${key} missing`);
  return item;
});
const output = { generatedAt: "2026-09-05", status: failures.length ? "FAILED" : "PASSED", regionPages: results.length, noindexCount: results.filter((item) => item.noindex).length, canonicalCount: results.filter((item) => item.canonical).length, canonicalExpectedWithoutSiteUrl: 0, browserH1Audit: "reports/region-v2-browser-audit.json", deploymentBlocker: "本番SITE_URL設定後にcanonical・og:url・sitemapを全195地域で照合", failures, results };
fs.writeFileSync("reports/region-v2-static-seo-audit.json", `${JSON.stringify(output, null, 2)}\n`); console.log(JSON.stringify({ status: output.status, pages: output.regionPages, noindex: output.noindexCount, canonical: output.canonicalCount, failures: failures.length }, null, 2)); if (failures.length) process.exitCode = 1;
