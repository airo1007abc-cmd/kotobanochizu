import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const files = (await readdir(join(root, "src/data/dialects"))).filter((file) => file.endsWith(".json"));
const dialects = (await Promise.all(files.map(async (file) => JSON.parse(await readFile(join(root, "src/data/dialects", file), "utf8"))))).flat();
const guides = JSON.parse(await readFile(join(root, "src/data/region-guides.json"), "utf8"));
const requiredScopes = ["phrase", "reading", "meaning", "region", "example", "usage"];
const confirmed = new Set(["verified", "reference_confirmed", "community_confirmed"]);
const grounded = (item) => {
  const scopes = new Set([...(item.evidenceScopes ?? []), ...(item.additionalSources ?? []).flatMap((source) => source.evidenceScopes ?? [])]);
  return confirmed.has(item.verificationStatus) && item.description?.length >= 100 && item.description.length <= 160 && item.sourceTitle && item.sourceUrl && item.sourceCheckedAt && item.exampleDialect && item.exampleStandard && requiredScopes.every((scope) => scopes.has(scope));
};
const selected = (guide) => dialects.filter((item) =>
  item.prefectureName === guide.prefectureName &&
  ((Array.isArray(guide.selector.dialectIds) && guide.selector.dialectIds.includes(item.id)) ||
    guide.selector.prefectureWide === true ||
    item.municipality?.startsWith(guide.selector.municipalityPrefix)) &&
  grounded(item),
);
const duplicates = (field) => {
  const map = new Map();
  for (const item of guides) {
    const key = String(item[field] ?? "").normalize("NFKC").replace(/\s/g, "");
    map.set(key, [...(map.get(key) ?? []), item.id]);
  }
  return [...map.values()].filter((ids) => ids.length > 1);
};
const duplicateDialectSets = (() => {
  const map = new Map();
  for (const guide of guides) {
    const key = selected(guide).map((item) => item.id).sort().join("|");
    map.set(key, [...(map.get(key) ?? []), guide.id]);
  }
  return [...map.values()].filter((ids) => ids.length > 1);
})();
const failures = [];
for (const guide of guides) {
  const entries = selected(guide);
  if (!["indexable", "review_required", "noindex"].includes(guide.indexStatus)) failures.push(`${guide.id}: 無効な公開判定`);
  if (!guide.id || !guide.slug || !guide.title || !guide.searchIntent || !guide.introduction || !guide.sourceTitle || !guide.sourceUrl || !guide.sourceCheckedAt) failures.push(`${guide.id ?? "unknown"}: 必須項目不足`);
  if (guide.description?.length < 100 || guide.description?.length > 160) failures.push(`${guide.id}: descriptionは100〜160文字（現在${guide.description?.length ?? 0}）`);
  if (guide.indexStatus === "indexable" && entries.length < 5) failures.push(`${guide.id}: indexable地域ガイドは確認済み5語以上が必要（現在${entries.length}）`);
  if (guide.indexStatus === "indexable" && guide.selector.prefectureWide === true && new Set(entries.map((item) => item.municipality)).size < 2) failures.push(`${guide.id}: 県別ガイドは確認地点2か所以上が必要`);
  if (Array.isArray(guide.selector.dialectIds)) {
    if (new Set(guide.selector.dialectIds).size !== guide.selector.dialectIds.length) failures.push(`${guide.id}: dialectIds内に重複あり`);
    if (entries.length !== guide.selector.dialectIds.length) failures.push(`${guide.id}: dialectIdsに不存在・地域不一致・品質ゲート未通過の項目あり`);
    if (guide.selector.requireMultipleMunicipalities === true && new Set(entries.map((item) => item.municipality)).size < 2) failures.push(`${guide.id}: 県内比較ガイドは確認地点2か所以上が必要`);
  }
}
for (const field of ["slug", "title", "description", "searchIntent"])
  if (duplicates(field).length) failures.push(`${field}重複: ${JSON.stringify(duplicates(field))}`);
if (duplicateDialectSets.length) failures.push(`dialectIds重複: ${JSON.stringify(duplicateDialectSets)}`);
const report = { generatedAt: new Date().toISOString(), total: guides.length, indexable: guides.filter((item) => item.indexStatus === "indexable").length, guideEntryCounts: Object.fromEntries(guides.map((guide) => [guide.id, selected(guide).length])), duplicateTitles: duplicates("title"), duplicateDescriptions: duplicates("description"), duplicateSearchIntents: duplicates("searchIntent"), duplicateDialectSets, failures };
await writeFile(join(root, "reports/region-guide-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
