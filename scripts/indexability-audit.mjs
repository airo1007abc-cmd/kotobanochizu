import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { hasCoreEvidence, hasEvidenceScope, isIndexableRecord } from "../src/evidencePolicy.mjs";
import { createDialectRoutePolicy } from "../src/dialectRoutePolicy.mjs";

const root = process.cwd();
const readJson = async (path) => JSON.parse(await readFile(join(root, path), "utf8"));
const dialectFiles = (await readdir(join(root, "src/data/dialects"))).filter((file) => file.endsWith(".json")).sort();
const records = (await Promise.all(dialectFiles.map((file) => readJson(`src/data/dialects/${file}`)))).flat();
const pages = await readJson("tmp/site-audit/route-decisions.json");
const redirects = await readJson("tmp/site-audit/redirects.json");
const seoSite = await readJson("reports/seo-site-audit.json");
const regionsByPrefecture = await readJson("src/data/regions.json");
const before = await readJson("reports/indexability-before.json");
const routePolicy = createDialectRoutePolicy(records);
const recordsById = new Map(records.map((record) => [record.id, record]));
const text = (value) => typeof value === "string" && value.trim() && !["unknown", "null", "undefined", "未記録"].includes(value.trim().toLowerCase());
const sources = (item) => [item.source ?? { title: item.sourceTitle, url: item.sourceUrl, checkedAt: item.sourceCheckedAt }, ...(item.additionalSources ?? [])]
  .filter((source) => source && text(source.title) && /^https?:\/\//.test(source.url ?? "") && text(source.checkedAt));
const countBy = (items, key) => Object.fromEntries([...Map.groupBy(items, key)].map(([name, group]) => [String(name), group.length]).sort(([a], [b]) => a.localeCompare(b, "ja")));
const pageType = (path) => path.startsWith("/dialects/") ? "dialect" : path.startsWith("/prefectures/") ? "prefecture" : path.startsWith("/regions/") ? "region" : path.startsWith("/meanings/") ? "meaning" : path.startsWith("/guides/regions/") ? "region_guide" : path.startsWith("/guides/culture/") ? "culture_guide" : path.startsWith("/stories/") ? "story" : "utility";
const pageTypes = Object.fromEntries([...Map.groupBy(pages, (page) => pageType(page.path))].map(([type, group]) => [type, { total: group.length, indexable: group.filter((page) => page.indexable).length, noindex: group.filter((page) => !page.indexable).length }]));

const recordReason = (item) => {
  if (!["verified", "reference_confirmed", "community_confirmed"].includes(item.verificationStatus)) return "verification_status";
  if (!sources(item).length) return "source_metadata";
  const missing = ["phrase", "meaning", "region"].filter((scope) => !hasEvidenceScope(item, scope));
  return missing.length ? `missing_core_${missing.join("_")}` : "core_eligible";
};
const noindexReasons = countBy(records.filter((item) => !isIndexableRecord(item)), recordReason);
const routeReason = (page) => {
  const type = pageType(page.path);
  if (type !== "dialect") return `${type}_policy`;
  const id = page.path.slice("/dialects/".length);
  const record = recordsById.get(id);
  if (!record) return "dialect_legacy_or_archived";
  if (routePolicy.collisionIds.has(id)) return "dialect_identity_collision";
  return `dialect_${recordReason(record)}`;
};
const noindexPages = pages.filter((page) => !page.indexable);
const indexablePages = pages.filter((page) => page.indexable);
const dialectPages = pages.filter((page) => pageType(page.path) === "dialect");
const routeNoindexReasons = countBy(noindexPages, routeReason);
const prefectures = Object.keys(regionsByPrefecture).map((name) => {
  const items = records.filter((item) => item.prefectureName === name);
  const core = items.filter(hasCoreEvidence).length;
  return { prefecture: name, total: items.length, coreEvidence: core, recordEligible: items.filter(isIndexableRecord).length, sourceCoverage: Number((items.filter((item) => sources(item).length).length / Math.max(items.length, 1)).toFixed(4)), gapTo30: Math.max(0, 30 - items.length), gapTo50: Math.max(0, 50 - items.length) };
});
const fieldCoverage = Object.fromEntries(["phrase", "meaning", "region", "reading", "example", "usage"].map((scope) => [scope, records.filter((item) => hasEvidenceScope(item, scope)).length]));
const sitemapFiles = (await readdir(join(root, "dist"))).filter((file) => /^sitemap-\d+\.xml$/.test(file));
const sitemapPaths = new Set();
for (const file of sitemapFiles) {
  const xml = await readFile(join(root, "dist", file), "utf8");
  for (const [, location] of xml.matchAll(/<loc>(.*?)<\/loc>/g)) sitemapPaths.add(decodeURI(new URL(location).pathname));
}
const redirectCount = Object.keys(redirects).length;
const reasonTotal = Object.values(routeNoindexReasons).reduce((sum, count) => sum + count, 0);
const invariantLists = {
  indexableDialectRoutesWithoutCoreEvidence: dialectPages.filter((page) => page.indexable && !hasCoreEvidence(recordsById.get(page.path.slice("/dialects/".length)))).map((page) => page.path),
  indexableIdentityCollisionRoutes: dialectPages.filter((page) => page.indexable && routePolicy.collisionIds.has(page.path.slice("/dialects/".length))).map((page) => page.path),
  duplicateIds: [...Map.groupBy(records, (item) => item.id)].filter(([, group]) => group.length > 1).map(([id]) => id),
  duplicateSlugs: [...Map.groupBy(records, (item) => item.slug)].filter(([slug, group]) => slug && group.length > 1).map(([slug]) => slug),
  noindexRoutesInSitemap: noindexPages.filter((page) => sitemapPaths.has(page.path)).map((page) => page.path),
};
const invariantCounts = {
  noindexReasonCountMismatch: reasonTotal === noindexPages.length ? 0 : reasonTotal - noindexPages.length,
  redirectCountMismatch: redirectCount === seoSite.totalStaticPages - pages.length ? 0 : redirectCount - (seoSite.totalStaticPages - pages.length),
  sitemapIndexableCountMismatch: sitemapPaths.size === indexablePages.length ? 0 : sitemapPaths.size - indexablePages.length,
};
const failures = [...Object.entries(invariantLists).flatMap(([name, values]) => values.length ? [`${name}: ${values.join(", ")}`] : []), ...Object.entries(invariantCounts).flatMap(([name, value]) => value ? [`${name}: ${value}`] : [])];
const report = {
  generatedAt: new Date().toISOString(), policyVersion: 2,
  policy: {
    recordEligibility: { required: ["publishable verificationStatus", "phrase", "standardJapanese", "valid source metadata", "phrase evidence", "meaning evidence", "region evidence"], optionalWithTransparentUi: ["reading", "example", "usage", "description length"] },
    routeIndexability: { required: ["record eligibility", "unique dialect identity"], parentPages: "Explicit child references require route-indexable dialects; region collections require at least five core-evidence records." },
  },
  dialects: {
    total: records.length, recordEligible: records.filter(isIndexableRecord).length, recordIneligible: records.filter((item) => !isIndexableRecord(item)).length,
    routeIndexable: dialectPages.filter((page) => page.indexable).length, routeNoindex: dialectPages.filter((page) => !page.indexable).length,
    coreEvidence: records.filter(hasCoreEvidence).length, identityCollisions: routePolicy.identityCollisions,
    verificationStatus: countBy(records, (item) => item.verificationStatus ?? "missing"), languageVariety: countBy(records, (item) => item.languageVariety ?? "unknown"),
    withSource: records.filter((item) => sources(item).length).length, withoutSource: records.filter((item) => !sources(item).length).length,
    fieldEvidence: fieldCoverage, missingReading: records.filter((item) => !text(item.reading)).length,
    missingExample: records.filter((item) => !text(item.exampleDialect) || !text(item.exampleStandard)).length,
    shortDescription: records.filter((item) => (item.description?.trim().length ?? 0) < 100).length,
    withMunicipality: records.filter((item) => text(item.municipality)).length, withLocality: records.filter((item) => text(item.locality)).length,
    withEvidenceRegion: records.filter((item) => text(item.evidenceRegion)).length, recordIneligibilityReasons: noindexReasons,
  },
  pages: { total: pages.length, indexable: indexablePages.length, noindex: noindexPages.length, redirects: redirectCount, sitemap: sitemapPaths.size, byType: pageTypes }, before,
  promotionSummary: { indexablePages: indexablePages.length - before.indexablePages, indexableDialectRoutes: (pageTypes.dialect?.indexable ?? 0) - before.indexableDialectRoutes, indexableRegionRoutes: (pageTypes.region?.indexable ?? 0) - before.indexableRegionRoutes, noindexPagesIncludingRedirects: noindexPages.length + redirectCount - before.noindexPagesIncludingRedirects },
  remainingNoindexRouteReasons: routeNoindexReasons, prefectures, gaps: { below30: prefectures.filter((item) => item.total < 30), below50: prefectures.filter((item) => item.total < 50) },
  invariants: { ...invariantLists, ...invariantCounts, noindexAndSitemapExclusionAlsoCheckedBy: "scripts/seo-site-audit.mjs" },
  status: failures.length ? "FAILED" : "PASSED", failures,
};
const md = `# Indexability audit\n\nGenerated: ${report.generatedAt}\n\n## Summary\n\n| Metric | Count |\n| --- | ---: |\n| Dialect records | ${report.dialects.total} |\n| Record eligible | ${report.dialects.recordEligible} |\n| Dialect routes indexable | ${report.dialects.routeIndexable} |\n| Dialect routes noindex | ${report.dialects.routeNoindex} |\n| Static route decisions | ${report.pages.total} |\n| Static routes indexable | ${report.pages.indexable} |\n| Static routes noindex | ${report.pages.noindex} |\n| Redirects | ${report.pages.redirects} |\n| Sitemap URLs | ${report.pages.sitemap} |\n\n## Before to after\n\n- Indexable pages: ${before.indexablePages} -> ${report.pages.indexable} (${report.promotionSummary.indexablePages >= 0 ? "+" : ""}${report.promotionSummary.indexablePages})\n- Indexable dialect routes: ${before.indexableDialectRoutes} -> ${pageTypes.dialect?.indexable ?? 0} (${report.promotionSummary.indexableDialectRoutes >= 0 ? "+" : ""}${report.promotionSummary.indexableDialectRoutes})\n- Indexable region routes: ${before.indexableRegionRoutes} -> ${pageTypes.region?.indexable ?? 0} (${report.promotionSummary.indexableRegionRoutes >= 0 ? "+" : ""}${report.promotionSummary.indexableRegionRoutes})\n\n## Remaining noindex routes\n\n${Object.entries(routeNoindexReasons).map(([reason, count]) => `- ${reason}: ${count}`).join("\n")}\n\n## Invariants\n\n- Status: ${report.status}\n- Noindex reason total: ${reasonTotal} / ${noindexPages.length}\n- Redirect manifest/site pages: ${redirectCount} / ${seoSite.totalStaticPages - pages.length}\n- Sitemap/indexable route decisions: ${sitemapPaths.size} / ${indexablePages.length}\n\n## Prefecture gaps\n\n${prefectures.filter((item) => item.total < 50).sort((a, b) => a.total - b.total).map((item) => `- ${item.prefecture}: ${item.total} records (to 30: ${item.gapTo30}, to 50: ${item.gapTo50})`).join("\n") || "- All prefectures have at least 50 records."}\n\n## Database readiness\n\nThe current 47-file JSON model remains workable at 3,000-5,000 records for static builds, but cross-record identity, claim-level evidence reuse, concurrent editing, and partial updates become increasingly costly. A future migration should separate \`dialect_entries\`, \`dialect_forms\`, \`places\`, \`dialect_places\`, \`sources\`, \`evidence_claims\`, \`examples\`, and \`publication_state\`. Indexability does not depend on that migration.\n`;
await mkdir(join(root, "reports"), { recursive: true });
await writeFile(join(root, "reports/indexability-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(join(root, "reports/indexability-audit.md"), md);
console.log(JSON.stringify({ status: report.status, dialects: report.dialects, pages: report.pages, invariants: report.invariants }, null, 2));
if (failures.length) process.exitCode = 1;
