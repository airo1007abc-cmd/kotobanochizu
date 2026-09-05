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
const editorialChangelog = read("reports/dialect-editorial-changelog.json");
const seo = read("reports/seo-site-audit.json");
const dialectFiles = fs.readdirSync(path.join(root, "src/data/dialects")).filter((file) => file.endsWith(".json"));
const rawDialects = dialectFiles.flatMap((file) => read(`src/data/dialects/${file}`));

const by = (items, selector) => Object.fromEntries([...new Set(items.map(selector).filter(Boolean))].sort().map((key) => [key, items.filter((item) => selector(item) === key).length]));
const prefById = new Map(prefectures.prefectures.map((item) => [item.prefectureId, item]));
const zeroRegionClassifications = ["intentional classification", "data missing", "source missing", "mapping issue candidate"];

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
  const samePrefecture = rawDialects.filter((dialect) => `p${dialect.prefectureCode}` === region.prefectureId);
  const nameMatchesWithDifferentId = samePrefecture.filter((dialect) => dialect.regionName === region.regionName && dialect.regionId !== region.regionId);
  let classification = "data missing";
  let priority = "P2";
  let reason = "設定済み地域だが、この地域へ根拠付きで割り当てられた方言レコードがない";
  if (nameMatchesWithDifferentId.length > 0) {
    classification = "mapping issue candidate";
    priority = "P1";
    reason = "同じ県・同じ地域名を持つ方言レコードが別regionIdへ結び付いている。ID統合前に経路を確認する";
  } else if (/未特定|広域|複数地域/.test(region.regionName)) {
    classification = "intentional classification";
    priority = "P3";
    reason = "複数地域・未特定データを安全に保持するための分類枠で、空であること自体は不整合ではない";
  } else if ((prefecture?.sourceCoverage ?? 0) < 0.5) {
    classification = "source missing";
    priority = prefecture?.indexableCount ? "P1" : "P2";
    reason = "県全体の出典確認率が50%未満で、地域への追加割当より資料調査を優先する";
  }
  const action = classification === "intentional classification"
    ? "keep_and_monitor"
    : classification === "mapping issue candidate"
      ? "mapping_review"
      : "source_research";
  return {
    regionId: region.regionId,
    prefectureId: region.prefectureId,
    prefecture: region.prefectureName,
    region: region.regionName,
    classification,
    priority,
    reason,
    evidence: {
      prefectureDialectCount: samePrefecture.length,
      prefectureSourceCoverage: prefecture?.sourceCoverage ?? null,
      exactRegionNameDifferentIdCount: nameMatchesWithDifferentId.length,
      candidateDialectIds: nameMatchesWithDifferentId.slice(0, 20).map((dialect) => dialect.id),
    },
    action,
    mutation: "HOLD",
  };
});

const informationPoor = navigation.informationPoorRegions.map((region) => {
  const sourceCoverage = region.dialectCount ? region.sourceCount / region.dialectCount : 0;
  const priority = region.dialectCount === 0 ? "P2" : region.sourceCount === 0 ? "P1" : "P2";
  const cultureEvidence = culture.filter((item) => item.regionId === region.id).map((item) => ({ id: item.id, title: item.title, sourceOrganization: item.sourceOrganization, sourceUrl: item.sourceUrl }));
  return {
    ...region,
    sourceCoverage: Number(sourceCoverage.toFixed(4)),
    cultureEvidence,
    priority,
    action: region.sourceCount === 0
      ? cultureEvidence.length > 0 ? "claim_mapping_review" : "public_source_research"
      : "editorial_depth_review",
    decision: "HOLD_until_evidence",
  };
});

const issues = dialectAudit.issues ?? [];
const priorityRecords = contentPriority.records ?? [];
const editorialDecisionByDialectId = new Map((editorialChangelog.decisions ?? []).map((item) => [item.id, item]));
const dialectQueueItem = (item, priority) => {
  const priorDecision = editorialDecisionByDialectId.get(item.id);
  const heldClaims = (priorDecision?.claims ?? []).filter((claim) => claim.decision === "HOLD");
  return {
    entityType: "dialect",
    id: item.id,
    label: item.word,
    prefecture: item.prefecture,
    priority,
    issues: item.issues,
    action: item.nextActions?.[0] ?? "manual_editor_review",
    decision: "HOLD",
    holdReason: heldClaims.length
      ? heldClaims.map((claim) => claim.reason).join(" ")
      : "編集ポリシーに従い、claim単位の資料確認が完了するまで本データを変更しない",
    priorEvidence: heldClaims.map((claim) => ({ claim: claim.claim, confidence: claim.confidence, exactFormMatch: claim.exactFormMatch, sourceTier: claim.sourceTier })),
  };
};
const researchQueue = [
  ...priorityRecords.filter((item) => item.priority === "P0").map((item) => dialectQueueItem(item, "P0")),
  ...zeroRegions.filter((item) => item.priority === "P1").map((item) => ({ entityType: "region", id: item.regionId, label: item.region, prefecture: item.prefecture, priority: item.priority, issues: [item.classification], action: item.action, decision: "HOLD" })),
  ...informationPoor.filter((item) => item.priority === "P1").map((item) => ({ entityType: "region", id: item.id, label: item.region, prefecture: item.prefecture, priority: "P1", issues: [item.sourceCount === 0 ? "source_missing" : "information_poor"], action: item.action, decision: "HOLD", cultureEvidence: item.cultureEvidence, holdReason: item.cultureEvidence.length > 0 ? "地域に対応する公的文化資料は確認済みだが、個別方言claimへの対応は未確認。語形・意味・採録地点を照合するまで出典へ転用しない" : "現行地域へ安全に対応付けられる公的方言資料の探索が必要" })),
  ...priorityRecords.filter((item) => item.priority === "P1").map((item) => dialectQueueItem(item, "P1")),
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
  blockingFailures: [
    ...(seo.brokenInternalLinks ?? []).map((item) => ({ type: "broken_internal_link", detail: item })),
    ...(seo.orphanStaticPages ?? []).map((item) => ({ type: "orphan_static_page", detail: item })),
    ...Array.from({ length: seo.missingRobotsDecision ?? 0 }, (_, index) => ({ type: "missing_robots_decision", index })),
    ...(seo.blockingDuplicateTitles ?? []).map((item) => ({ type: "indexable_duplicate_title", detail: item })),
    ...(seo.blockingDuplicateDescriptions ?? []).map((item) => ({ type: "indexable_duplicate_description", detail: item })),
  ],
};

write("reports/culture-coverage.json", cultureCoverage);
const zeroClassificationCounts = Object.fromEntries(zeroRegionClassifications.map((classification) => [classification, zeroRegions.filter((item) => item.classification === classification).length]));
write("reports/zero-region-audit.json", { generatedAt: now, total: zeroRegions.length, byClassification: zeroClassificationCounts, byPriority: by(zeroRegions, (item) => item.priority), autoFixed: 0, policy: "Exact existing IDs may be repaired only after route and source review; linguistic assignments remain HOLD.", items: zeroRegions });
write("reports/low-coverage-regions.json", { generatedAt: now, total: informationPoor.length, byPriority: by(informationPoor, (item) => item.priority), items: informationPoor });
write("reports/next-research-queue.json", { generatedAt: now, total: researchQueue.length, byPriority: by(researchQueue, (item) => item.priority), policy: "No claim is promoted without source-tier, confidence and exact-form review.", items: researchQueue });
write("reports/production-audit.json", productionAudit);
console.log(JSON.stringify({ culture: cultureCoverage.total, culturePrefectures: cultureCoverage.prefecturesCovered, zeroRegions: zeroRegions.length, zeroClassifications: zeroClassificationCounts, lowCoverageRegions: informationPoor.length, queue: researchQueue.length, productionBlockingFailures: productionAudit.blockingFailures.length }, null, 2));
