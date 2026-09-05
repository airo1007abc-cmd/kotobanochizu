import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
const root = process.cwd();
const files = (await readdir(join(root, "src/data/dialects"))).filter((file) => file.endsWith(".json"));
const dialects = (await Promise.all(files.map(async (file) => JSON.parse(await readFile(join(root, "src/data/dialects", file), "utf8"))))).flat();
const guides = JSON.parse(await readFile(join(root, "src/data/culture-guides.json"), "utf8"));
const byId = new Map(dialects.map((item) => [item.id, item]));
const required = ["phrase", "reading", "meaning", "region", "example", "usage"];
const confirmed = new Set(["verified", "reference_confirmed", "community_confirmed"]);
const grounded = (item) => { const scopes = new Set([...(item?.evidenceScopes ?? []), ...(item?.additionalSources ?? []).flatMap((source) => source.evidenceScopes ?? [])]); return Boolean(item && confirmed.has(item.verificationStatus) && item.description?.length >= 100 && item.description.length <= 160 && item.sourceTitle && item.sourceUrl && item.sourceCheckedAt && item.exampleDialect && item.exampleStandard && required.every((scope) => scopes.has(scope))); };
const duplicate = (field) => { const map = new Map(); for (const item of guides) { const key = String(item[field] ?? "").normalize("NFKC").replace(/\s/g, ""); map.set(key, [...(map.get(key) ?? []), item.id]); } return [...map.values()].filter((ids) => ids.length > 1); };
const duplicateSets = (() => { const map = new Map(); for (const item of guides) { const key = [...item.dialectIds].sort().join("|"); map.set(key, [...(map.get(key) ?? []), item.id]); } return [...map.values()].filter((ids) => ids.length > 1); })();
const failures = [];
for (const guide of guides) {
  const linked = guide.dialectIds.map((id) => byId.get(id));
  if (!guide.id || !guide.slug || !guide.category || !guide.title || !guide.searchIntent || !guide.introduction || !guide.sourceTitle || !guide.sourceUrl || !guide.sourceCheckedAt) failures.push(`${guide.id ?? "unknown"}: 必須項目不足`);
  if (guide.description?.length < 100 || guide.description?.length > 160) failures.push(`${guide.id}: descriptionは100〜160文字（現在${guide.description?.length ?? 0}）`);
  if (guide.indexStatus === "indexable" && (linked.length < 3 || linked.some((item) => !grounded(item)))) failures.push(`${guide.id}: indexable文化記事は品質ゲート済み3語以上が必要`);
}
for (const field of ["slug", "title", "description", "searchIntent"]) if (duplicate(field).length) failures.push(`${field}重複: ${JSON.stringify(duplicate(field))}`);
if (duplicateSets.length) failures.push(`dialectIds重複: ${JSON.stringify(duplicateSets)}`);
const report = { generatedAt: new Date().toISOString(), total: guides.length, indexable: guides.filter((item) => item.indexStatus === "indexable").length, articleEntryCounts: Object.fromEntries(guides.map((guide) => [guide.id, guide.dialectIds.length])), duplicateTitles: duplicate("title"), duplicateDescriptions: duplicate("description"), duplicateSearchIntents: duplicate("searchIntent"), duplicateDialectSets: duplicateSets, failures };
await writeFile(join(root, "reports/culture-guide-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
