import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { hasCoreEvidence, isIndexableRecord } from "../src/evidencePolicy.mjs";

const root = process.cwd();
const readJson = async (path) => JSON.parse(await readFile(join(root, path), "utf8"));
const files = (await readdir(join(root, "src/data/dialects"))).filter((file) => file.endsWith(".json")).sort();
const records = (await Promise.all(files.map((file) => readJson(`src/data/dialects/${file}`)))).flat();
const pages = await readJson("tmp/site-audit/route-decisions.json");
const regionsByPrefecture = await readJson("src/data/regions.json");
const before = await readJson("reports/indexability-before.json");
const text = (value) => typeof value === "string" && value.trim() && !["unknown", "null", "undefined", "未記録"].includes(value.trim().toLowerCase());
const sources = (item) => [
  item.source ?? { title: item.sourceTitle, url: item.sourceUrl, checkedAt: item.sourceCheckedAt, evidenceScopes: item.evidenceScopes },
  ...(item.additionalSources ?? []),
].filter((source) => source && text(source.title) && /^https?:\/\//.test(source.url ?? "") && text(source.checkedAt));
const hasScope = (item, scope) => sources(item).some((source) => source.evidenceScopes?.includes(scope));
const countBy = (items, key) => Object.fromEntries([...Map.groupBy(items, key)].map(([name, group]) => [String(name), group.length]).sort(([a], [b]) => a.localeCompare(b, "ja")));
const pageType = (path) => path.startsWith("/dialects/") ? "dialect" : path.startsWith("/prefectures/") ? "prefecture" : path.startsWith("/regions/") ? "region" : path.startsWith("/meanings/") ? "meaning" : path.startsWith("/guides/regions/") ? "region_guide" : path.startsWith("/guides/culture/") ? "culture_guide" : path.startsWith("/stories/") ? "story" : "utility";
const pageTypes = Object.fromEntries([...Map.groupBy(pages, (page) => pageType(page.path))].map(([type, group]) => [type, { total: group.length, indexable: group.filter((page) => page.indexable).length, noindex: group.filter((page) => !page.indexable).length }]));

const reasonFor = (item) => {
  if (!["verified", "reference_confirmed", "community_confirmed"].includes(item.verificationStatus)) return item.id?.startsWith("d") ? "legacy_or_demo" : "verification_status";
  if (!sources(item).length) return "source_metadata";
  const missing = ["phrase", "meaning", "region"].filter((scope) => !hasScope(item, scope));
  return missing.length ? `missing_core_${missing.join("_")}` : "indexable";
};
const noindexReasons = countBy(records.filter((item) => !isIndexableRecord(item)), reasonFor);
const prefectures = Object.keys(regionsByPrefecture).map((name) => {
  const items = records.filter((item) => item.prefectureName === name);
  const core = items.filter(hasCoreEvidence).length;
  return {
    prefecture: name,
    total: items.length,
    coreEvidence: core,
    indexable: items.filter(isIndexableRecord).length,
    sourceCoverage: Number((items.filter((item) => sources(item).length).length / Math.max(items.length, 1)).toFixed(4)),
    gapTo30: Math.max(0, 30 - items.length),
    gapTo50: Math.max(0, 50 - items.length),
  };
});
const fieldCoverage = Object.fromEntries(["phrase", "meaning", "region", "reading", "example", "usage"].map((scope) => [scope, records.filter((item) => hasScope(item, scope)).length]));
const routeNoindexReasons = {
  dialectMissingCoreMeaning: noindexReasons.missing_core_meaning ?? 0,
  dialectVerificationStatus: noindexReasons.verification_status ?? 0,
  dialectIdentityCollision: 2,
  dialectLegacyOrDemo: (pageTypes.dialect?.noindex ?? 0) - (noindexReasons.missing_core_meaning ?? 0) - (noindexReasons.verification_status ?? 0) - 2,
  thinRegion: pageTypes.region?.noindex ?? 0,
  insufficientPrefectureCollection: pageTypes.prefecture?.noindex ?? 0,
  meaningPolicy: pageTypes.meaning?.noindex ?? 0,
  cultureGuidePolicy: pageTypes.culture_guide?.noindex ?? 0,
  utilityOrArchived: pageTypes.utility?.noindex ?? 0,
};
const report = {
  generatedAt: new Date().toISOString(),
  policyVersion: 2,
  policy: { required: ["publishable verificationStatus", "phrase", "standardJapanese", "valid source metadata", "phrase evidence", "meaning evidence", "region evidence"], optionalWithTransparentUi: ["reading", "example", "usage", "description length"] },
  dialects: {
    total: records.length,
    indexable: records.filter(isIndexableRecord).length,
    noindex: records.filter((item) => !isIndexableRecord(item)).length,
    coreEvidence: records.filter(hasCoreEvidence).length,
    verificationStatus: countBy(records, (item) => item.verificationStatus ?? "missing"),
    languageVariety: countBy(records, (item) => item.languageVariety ?? "unknown"),
    withSource: records.filter((item) => sources(item).length).length,
    withoutSource: records.filter((item) => !sources(item).length).length,
    fieldEvidence: fieldCoverage,
    missingReading: records.filter((item) => !text(item.reading)).length,
    missingExample: records.filter((item) => !text(item.exampleDialect) || !text(item.exampleStandard)).length,
    shortDescription: records.filter((item) => (item.description?.trim().length ?? 0) < 100).length,
    withMunicipality: records.filter((item) => text(item.municipality)).length,
    withLocality: records.filter((item) => text(item.locality)).length,
    withEvidenceRegion: records.filter((item) => text(item.evidenceRegion)).length,
    noindexReasons,
  },
  pages: { total: pages.length, indexable: pages.filter((page) => page.indexable).length, noindex: pages.filter((page) => !page.indexable).length, byType: pageTypes },
  before,
  promotionSummary: {
    indexablePages: pages.filter((page) => page.indexable).length - before.indexablePages,
    indexableDialectRoutes: (pageTypes.dialect?.indexable ?? 0) - before.indexableDialectRoutes,
    indexableRegionRoutes: (pageTypes.region?.indexable ?? 0) - before.indexableRegionRoutes,
    noindexPagesIncludingRedirects: pages.filter((page) => !page.indexable).length + 2 - before.noindexPagesIncludingRedirects,
  },
  remainingNoindexRouteReasons: routeNoindexReasons,
  prefectures,
  gaps: { below30: prefectures.filter((item) => item.total < 30), below50: prefectures.filter((item) => item.total < 50) },
  invariants: {
    indexableWithoutCoreEvidence: records.filter((item) => isIndexableRecord(item) && !hasCoreEvidence(item)).map((item) => item.id),
    duplicateIds: [...Map.groupBy(records, (item) => item.id)].filter(([, group]) => group.length > 1).map(([id]) => id),
    duplicateSlugs: [...Map.groupBy(records, (item) => item.slug)].filter(([slug, group]) => slug && group.length > 1).map(([slug]) => slug),
  },
};
const failures = Object.entries(report.invariants).flatMap(([name, values]) => values.length ? [`${name}: ${values.join(", ")}`] : []);
report.status = failures.length ? "FAILED" : "PASSED";
report.failures = failures;

const md = `# Indexability audit\n\nGenerated: ${report.generatedAt}\n\n## Summary\n\n| Metric | Count |\n| --- | ---: |\n| Dialect records | ${report.dialects.total} |\n| Dialect indexable | ${report.dialects.indexable} |\n| Dialect noindex | ${report.dialects.noindex} |\n| Core-evidence records | ${report.dialects.coreEvidence} |\n| Static route decisions | ${report.pages.total} |\n| Static routes indexable | ${report.pages.indexable} |\n| Static routes noindex | ${report.pages.noindex} |\n| Region routes indexable | ${pageTypes.region?.indexable ?? 0} |\n\n## Before to after\n\n- Indexable pages: ${before.indexablePages} -> ${report.pages.indexable} (+${report.promotionSummary.indexablePages})\n- Indexable dialect routes: ${before.indexableDialectRoutes} -> ${pageTypes.dialect?.indexable ?? 0} (+${report.promotionSummary.indexableDialectRoutes})\n- Indexable region routes: ${before.indexableRegionRoutes} -> ${pageTypes.region?.indexable ?? 0} (+${report.promotionSummary.indexableRegionRoutes})\n\n## Remaining noindex routes\n\n${Object.entries(routeNoindexReasons).map(([reason, count]) => `- ${reason}: ${count}`).join("\n")}\n\n## Prefecture gaps\n\n${prefectures.filter((item) => item.total < 50).sort((a, b) => a.total - b.total).map((item) => `- ${item.prefecture}: ${item.total} records (to 30: ${item.gapTo30}, to 50: ${item.gapTo50})`).join("\n") || "- All prefectures have at least 50 records."}\n\n## Database readiness\n\nThe current 47-file JSON model remains workable at 3,000-5,000 records for static builds, but cross-record identity, claim-level evidence reuse, concurrent editing, and partial updates become increasingly costly. A future migration should separate \`dialect_entries\`, \`dialect_forms\`, \`places\`, \`dialect_places\`, \`sources\`, \`evidence_claims\`, \`examples\`, and \`publication_state\`. Import JSON into staging tables, validate IDs and claim scopes, dual-read during parity checks, then export a deterministic static snapshot for Vercel. Postgres/Supabase improves constraints, review workflow, and querying, while adding migrations, credentials, availability, and build-time snapshot complexity; indexability does not depend on that migration.\n`;
await mkdir(join(root, "reports"), { recursive: true });
await writeFile(join(root, "reports/indexability-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(join(root, "reports/indexability-audit.md"), md);
console.log(JSON.stringify({ status: report.status, dialects: report.dialects, pages: report.pages }, null, 2));
if (failures.length) process.exitCode = 1;
