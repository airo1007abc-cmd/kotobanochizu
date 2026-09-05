import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dialectFiles = (await readdir(join(root, "src/data/dialects"))).filter((file) => file.endsWith(".json"));
const dialects = (await Promise.all(dialectFiles.map(async (file) => JSON.parse(await readFile(join(root, "src/data/dialects", file), "utf8"))))).flat();
const comparisons = JSON.parse(await readFile(join(root, "src/data/meaning-comparisons.json"), "utf8"));
const dialectById = new Map(dialects.map((item) => [item.id, item]));
const confirmed = new Set(["verified", "reference_confirmed", "community_confirmed"]);
const requiredScopes = ["phrase", "reading", "meaning", "region", "example", "usage"];
const isGrounded = (item) => {
  const scopes = new Set([...(item?.evidenceScopes ?? []), ...(item?.additionalSources ?? []).flatMap((source) => source.evidenceScopes ?? [])]);
  return Boolean(item && confirmed.has(item.verificationStatus) && item.sourceTitle && item.sourceUrl && item.sourceCheckedAt && item.description?.length >= 100 && item.description.length <= 160 && item.exampleDialect && item.exampleStandard && requiredScopes.every((scope) => scopes.has(scope)));
};
const duplicateValues = (field) => {
  const groups = new Map();
  for (const item of comparisons) {
    const key = String(item[field] ?? "").normalize("NFKC").replace(/\s/g, "");
    groups.set(key, [...(groups.get(key) ?? []), item.id]);
  }
  return [...groups.values()].filter((ids) => ids.length > 1);
};
const duplicateDialectSets = (() => {
  const groups = new Map();
  for (const item of comparisons) {
    const key = [...item.dialectIds].sort().join("|");
    groups.set(key, [...(groups.get(key) ?? []), item.id]);
  }
  return [...groups.values()].filter((ids) => ids.length > 1);
})();
const failures = [];
for (const item of comparisons) {
  const linked = item.dialectIds.map((id) => dialectById.get(id));
  if (!item.id || !item.slug || !item.meaning || !item.title || !item.searchIntent || !item.caution || !item.sourceCheckedAt) failures.push(`${item.id ?? "unknown"}: 必須項目不足`);
  if (item.description?.length < 100 || item.description?.length > 160) failures.push(`${item.id}: descriptionは100〜160文字（現在${item.description?.length ?? 0}）`);
  if (linked.some((entry) => !entry)) failures.push(`${item.id}: 存在しない方言ID`);
  if (item.indexStatus === "indexable" && linked.some((entry) => !isGrounded(entry))) failures.push(`${item.id}: indexableなのに品質ゲート未通過の方言を参照`);
  if (item.indexStatus === "indexable" && new Set(linked.filter(Boolean).map((entry) => entry.prefectureName)).size < 2) failures.push(`${item.id}: indexableなのに2都道府県未満`);
  if (!["indexable", "review_required", "noindex"].includes(item.indexStatus)) failures.push(`${item.id}: 無効な公開判定`);
}
for (const [label, groups] of [["title", duplicateValues("title")], ["description", duplicateValues("description")], ["searchIntent", duplicateValues("searchIntent")], ["dialectIds", duplicateDialectSets]])
  if (groups.length) failures.push(`${label}重複: ${JSON.stringify(groups)}`);

const report = {
  generatedAt: new Date().toISOString(),
  total: comparisons.length,
  indexable: comparisons.filter((item) => item.indexStatus === "indexable").length,
  duplicateTitles: duplicateValues("title"),
  duplicateDescriptions: duplicateValues("description"),
  duplicateSearchIntents: duplicateValues("searchIntent"),
  duplicateDialectSets,
  failures,
};
await writeFile(join(root, "reports/meaning-content-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
