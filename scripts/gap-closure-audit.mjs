import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
const now = new Date().toISOString();
const culture = read("src/data/regional-culture.json");
const regionBaseline = read("reports/region-v2-baseline.json");
const navigation = read("reports/region-navigation-audit.json");
const prefectures = read("reports/prefecture-v2-baseline.json");
const dialectAudit = read("reports/dialect-v2-content-audit.json");
const contentPriority = read("reports/dialect-content-priority.json");
const duplicateReview = read("reports/dialect-duplicate-review.json");
const seo = read("reports/seo-site-audit.json");

const by = (items, selector) => Object.fromEntries([...new Set(items.map(selector).filter(Boolean))].sort().map((key) => [key, items.filter((item) => selector(item) === key).length]));
const prefById = new Map(prefectures.prefectures.map((item) => [item.prefectureId, item]));

const cultureCoverage = {
  generatedAt: now,
  total: culture.length,
  prefecturesCovered: new Set(culture.map((item) => item.prefectureId)).size,
  regionLinked: culture.filter((item) => item.regionId).length,
  byPrefecture: by(culture, (item) => item.prefectureId),
  byType: by(culture, (item) => item.type),
  byAccessType: by(culture, (item) => item.accessType),
  byRightsStatus: by(culture, (item) => item.rightsStatus),
  byLanguageVariety: by(culture, (item) => item.languageVariety ?? "not_recorded"),
  uncoveredPrefectures: prefectures.prefectures.filter((prefecture) => !culture.some((item) => item.prefectureId === prefecture.prefectureId)).map((item) => ({ prefectureId: item.prefectureId, prefecture: item.prefectureName })),
};

const zeroRegions = regionBaseline.regions.filter((item) => item.dialectCount === 0).map((region) => {
  const prefecture = prefById.get(region.prefectureId);
  let classification = "data missing";
  let priority = "P2";
  let reason = "設定済み地域だが、この地域へ根拠付きで割り当てられた方言レコードがない";
  if (/未特定|広域|複数地域/.test(region.regionName)) {
    classification = "intentional classification";
    priority = "P3";
    reason = "複数地域・未特定データを安全に保持するための分類枠で、空であること自体は不整合ではない";
  } else if ((prefecture?.sourceCoverage ?? 0) < 0.5) {
    classification = "source missing";
    priority = prefecture?.indexableCount ? "P1" : "P2";
    reason = "県全体の出典確認率が50%未満で、地域への追加割当より資料調査を優先する";
  }
  return { regionId: region.regionId, prefectureId: region.prefectureId, prefecture: region.prefectureName, region: region.regionName, classification, priority, reason, action: classification === "intentional classification" ? "keep_and_monitor" : "source_research", mutation: "HOLD" };
});

const informationPoor = navigation.informationPoorRegions.map((region) => {
  const sourceCoverage = region.dialectCount ? region.sourceCount / region.dialectCount : 0;
  const priority = region.dialectCount === 0 ? "P2" : region.sourceCount === 0 ? "P1" : "P2";
  return { ...region, sourceCoverage: Number(sourceCoverage.toFixed(4)), priority, action: region.sourceCount === 0 ? "public_source_research" : "editorial_depth_review", decision: "HOLD_until_evidence" };
});

const issues = dialectAudit.issues ?? [];
const priorityRecords = contentPriority.records ?? [];
const researchQueue = [
  ...priorityRecords.filter((item) => item.priority === "P0").map((item) => ({ entityType: "dialect", id: item.id, label: item.word, prefecture: item.prefecture, priority: "P0", issues: item.issues, action: item.nextActions?.[0] ?? "manual_editor_review", decision: "HOLD" })),
  ...zeroRegions.filter((item) => item.priority === "P1").map((item) => ({ entityType: "region", id: item.regionId, label: item.region, prefecture: item.prefecture, priority: item.priority, issues: [item.classification], action: item.action, decision: "HOLD" })),
  ...informationPoor.filter((item) => item.priority === "P1").map((item) => ({ entityType: "region", id: item.id, label: item.region, prefecture: item.prefecture, priority: "P1", issues: [item.sourceCount === 0 ? "source_missing" : "information_poor"], action: item.action, decision: "HOLD" })),
  ...priorityRecords.filter((item) => item.priority === "P1").map((item) => ({ entityType: "dialect", id: item.id, label: item.word, prefecture: item.prefecture, priority: "P1", issues: item.issues, action: item.nextActions?.[0] ?? "manual_editor_review", decision: "HOLD" })),
];

const productionAudit = {
  generatedAt: now,
  source: "latest local production build/static audit; live recheck required after deploy",
  totalStaticPages: seo.totalStaticPages,
  indexable: seo.indexable,
  noindex: seo.noindex,
  brokenInternalLinks: seo.brokenInternalLinks ?? [],
  orphanStaticPages: seo.orphanStaticPages ?? [],
  missingRobotsDecision: seo.missingRobotsDecision,
  duplicateTitleGroups: seo.duplicateTitles?.length ?? 0,
  duplicateDescriptionGroups: seo.duplicateDescriptions?.length ?? 0,
  contentDuplicateGroups: duplicateReview.summary?.groups ?? 0,
  blockingFailures: [ ...(seo.brokenInternalLinks ?? []), ...(seo.orphanStaticPages ?? []) ],
};

write("reports/culture-coverage.json", cultureCoverage);
write("reports/zero-region-audit.json", { generatedAt: now, total: zeroRegions.length, byClassification: by(zeroRegions, (item) => item.classification), byPriority: by(zeroRegions, (item) => item.priority), autoFixed: 0, items: zeroRegions });
write("reports/low-coverage-regions.json", { generatedAt: now, total: informationPoor.length, byPriority: by(informationPoor, (item) => item.priority), items: informationPoor });
write("reports/next-research-queue.json", { generatedAt: now, total: researchQueue.length, byPriority: by(researchQueue, (item) => item.priority), policy: "No claim is promoted without source-tier, confidence and exact-form review.", items: researchQueue });
write("reports/production-audit.json", productionAudit);
console.log(JSON.stringify({ culture: cultureCoverage.total, culturePrefectures: cultureCoverage.prefecturesCovered, zeroRegions: zeroRegions.length, zeroClassifications: by(zeroRegions, (item) => item.classification), lowCoverageRegions: informationPoor.length, queue: researchQueue.length, productionBlockingFailures: productionAudit.blockingFailures.length }, null, 2));
