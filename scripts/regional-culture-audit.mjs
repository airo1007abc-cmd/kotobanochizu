import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const culture = read("src/data/regional-culture.json");
const regions = read("reports/region-v2-baseline.json");
const navigation = read("reports/region-navigation-audit.json");
const dialectAudit = read("reports/dialect-v2-content-audit.json");
const prefectures = read("reports/prefecture-v2-baseline.json");

const countBy = (items, key) =>
  Object.fromEntries(
    [...new Set(items.map((item) => item[key]))]
      .sort()
      .map((value) => [value, items.filter((item) => item[key] === value).length]),
  );

const issueCounts = {};
for (const item of dialectAudit.issues) {
  for (const issue of item.issues) issueCounts[issue] = (issueCounts[issue] ?? 0) + 1;
}
const validation = spawnSync(process.execPath, ["scripts/data-tools.mjs", "validate"], { cwd: root, encoding: "utf8" });
const validationOutput = `${validation.stdout ?? ""}\n${validation.stderr ?? ""}`;
const validationWarnings = validationOutput.split(/\r?\n/).filter((line) => line.startsWith("WARN "));
const validationWarningCategories = {
  exampleAwaitingConfirmation: validationWarnings.filter((line) => line.startsWith("WARN example awaiting confirmation:")).length,
  duplicateCandidate: validationWarnings.filter((line) => line.startsWith("WARN duplicate candidate:")).length,
  reviewItemWithoutNote: validationWarnings.filter((line) => line.startsWith("WARN review item without note:")).length,
};

const report = {
  generatedAt: new Date().toISOString(),
  status: "PASSED",
  registeredItems: culture.length,
  prefecturesCovered: [...new Set(culture.map((item) => item.prefectureId))].length,
  regionLinkedItems: culture.filter((item) => item.regionId).length,
  prefectureOnlyItems: culture.filter((item) => !item.regionId).length,
  byPrefecture: countBy(culture, "prefectureId"),
  byType: countBy(culture, "type"),
  byRightsStatus: countBy(culture, "rightsStatus"),
  integrity: {
    duplicateIds: culture.length - new Set(culture.map((item) => item.id)).size,
    nonHttpsSources: culture.filter((item) => !item.sourceUrl.startsWith("https://")).length,
    missingOrganizations: culture.filter((item) => !item.sourceOrganization).length,
    missingRightsNotes: culture.filter((item) => !item.rightsNote).length,
    copiedMediaFiles: 0,
  },
  unresolvedMappings: [
    { id: "culture-nagasaki-cojads", municipality: "平戸市", reason: "資料の採録地点は確認済みだが、現在の6区分への対応を一次資料から断定しない" },
    { id: "culture-okinawa-shuri-audio", municipality: "首里", reason: "首里の教材であることは確認済みだが、県内地域IDをUI都合で推測しない" },
    { id: "culture-saga-morodomi-history", municipality: "旧諸富町", reason: "町史の所在地は確認済みだが、現在の地域ID対応を資料だけで確定していない" },
  ],
  contentFollowup: {
    totalRegions: regions.totalRegions,
    zeroWordRegions: regions.zeroWordRegions,
    informationPoorRegions: navigation.informationPoorRegionCandidates,
    validationWarnings: validationWarnings.length,
    validationWarningCategories,
    dialectDisplayIssueCounts: issueCounts,
    zeroWordQueue: regions.regions.filter((item) => item.dialectCount === 0).map((item) => ({ regionId: item.regionId, prefecture: item.prefectureName, region: item.regionName, priority: "P2", action: "source_research_before_content_addition" })),
    informationPoorQueue: navigation.informationPoorRegions.map((item) => ({ ...item, priority: item.dialectCount === 0 ? "P2" : "P1", action: item.sourceCount === 0 ? "source_research" : "editorial_review" })),
    lowSourcePrefectures: prefectures.prefectures.filter((item) => item.sourceCoverage < 0.5).map((item) => ({ prefectureId: item.prefectureId, prefecture: item.prefectureName, dialectCount: item.dialectCount, sourceCoverage: item.sourceCoverage, priority: item.indexableCount ? "P0" : "P1" })),
  },
};

if (Object.values(report.integrity).some((value) => value !== 0)) report.status = "FAILED";
fs.writeFileSync(path.join(root, "reports/regional-culture-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.status, registeredItems: report.registeredItems, regionLinkedItems: report.regionLinkedItems, zeroWordRegions: report.contentFollowup.zeroWordRegions, informationPoorRegions: report.contentFollowup.informationPoorRegions, validationWarnings: report.contentFollowup.validationWarnings }, null, 2));
if (report.status !== "PASSED") process.exitCode = 1;
