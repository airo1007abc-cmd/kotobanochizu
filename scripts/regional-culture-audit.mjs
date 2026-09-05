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
const prefectureIds = new Set(prefectures.prefectures.map((item) => item.prefectureId));
const regionById = new Map(regions.regions.map((item) => [item.regionId, item]));

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

const duplicateGroups = (field) => {
  const groups = new Map();
  for (const item of culture) {
    const value = String(item[field] ?? "").trim();
    if (!value) continue;
    groups.set(value, [...(groups.get(value) ?? []), item.id]);
  }
  return [...groups.entries()].filter(([, ids]) => ids.length > 1).map(([value, ids]) => ({ value, ids }));
};
const itemIssues = culture.map((item) => {
  const issues = [];
  const region = item.regionId ? regionById.get(item.regionId) : undefined;
  if (!prefectureIds.has(item.prefectureId)) issues.push("unknown_prefecture");
  if (item.regionId && !region) issues.push("unknown_region");
  if (region && region.prefectureId !== item.prefectureId) issues.push("region_prefecture_mismatch");
  if (!item.sourceTitle) issues.push("missing_source_title");
  if (!item.sourceOrganization) issues.push("missing_publisher");
  if (!/^https:\/\//.test(item.sourceUrl ?? "")) issues.push("unsafe_or_non_https_source");
  if (!item.rightsStatus) issues.push("missing_rights_status");
  if (!item.accessType) issues.push("missing_access_type");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.verifiedAt ?? "")) issues.push("invalid_verified_at");
  if (item.accessType === "embed" && item.rightsStatus !== "permission_confirmed" && item.rightsStatus !== "public_domain") issues.push("unsafe_embed");
  return { id: item.id, issues };
}).filter((item) => item.issues.length);
const duplicateIds = duplicateGroups("id");
const duplicateSources = duplicateGroups("sourceUrl");
const shouldCheckLinks = process.env.CHECK_CULTURE_LINKS === "1";
const uniqueSourceUrls = [...new Set(culture.map((item) => item.sourceUrl))];
const liveLinks = shouldCheckLinks
  ? await Promise.all(uniqueSourceUrls.map(async (url) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal, headers: { "user-agent": "Kotoba-no-Chizu-Link-Audit/1.0" } });
        return { url, status: response.status, ok: response.ok, finalUrl: response.url, result: response.status === 404 || response.status === 410 ? "broken" : response.ok ? "reachable" : "restricted_or_unresolved" };
      } catch (error) {
        return { url, status: null, ok: false, finalUrl: null, result: "network_unresolved", error: error instanceof Error ? error.message : String(error) };
      } finally {
        clearTimeout(timer);
      }
    }))
  : [];
const brokenLiveLinks = liveLinks.filter((item) => item.result === "broken");

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
  byAccessType: countBy(culture, "accessType"),
  byLanguageVariety: countBy(culture, "languageVariety"),
  integrity: {
    duplicateIds: duplicateIds.length,
    duplicateSourceGroups: duplicateSources.length,
    nonHttpsSources: culture.filter((item) => !item.sourceUrl.startsWith("https://")).length,
    missingOrganizations: culture.filter((item) => !item.sourceOrganization).length,
    missingRightsNotes: culture.filter((item) => !item.rightsNote).length,
    copiedMediaFiles: 0,
    unsafeEmbeds: culture.filter((item) => item.accessType === "embed" && !["permission_confirmed", "public_domain"].includes(item.rightsStatus)).length,
    itemIssueCount: itemIssues.length,
  },
  duplicateSources,
  liveLinkAudit: {
    performed: shouldCheckLinks,
    checked: liveLinks.length,
    reachable: liveLinks.filter((item) => item.result === "reachable").length,
    restrictedOrUnresolved: liveLinks.filter((item) => item.result === "restricted_or_unresolved" || item.result === "network_unresolved").length,
    broken: brokenLiveLinks.length,
    results: liveLinks,
  },
  itemIssues,
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

if ([report.integrity.duplicateIds, report.integrity.nonHttpsSources, report.integrity.missingOrganizations, report.integrity.missingRightsNotes, report.integrity.copiedMediaFiles, report.integrity.unsafeEmbeds, report.integrity.itemIssueCount, brokenLiveLinks.length].some((value) => value !== 0)) report.status = "FAILED";
fs.writeFileSync(path.join(root, "reports/regional-culture-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.status, registeredItems: report.registeredItems, regionLinkedItems: report.regionLinkedItems, zeroWordRegions: report.contentFollowup.zeroWordRegions, informationPoorRegions: report.contentFollowup.informationPoorRegions, validationWarnings: report.contentFollowup.validationWarnings }, null, 2));
if (report.status !== "PASSED") process.exitCode = 1;
