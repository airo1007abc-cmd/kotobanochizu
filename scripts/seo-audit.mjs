import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dialectDir = join(root, "src/data/dialects");
const files = (await readdir(dialectDir)).filter((file) => file.endsWith(".json"));
const dialects = (await Promise.all(files.map(async (file) => JSON.parse(await readFile(join(dialectDir, file), "utf8"))))).flat();
const confirmed = new Set(["verified", "reference_confirmed", "community_confirmed"]);
const classify = (item) => {
  const scopes = new Set([...(item.evidenceScopes ?? []), ...(item.additionalSources ?? []).flatMap((source) => source.evidenceScopes ?? [])]);
  const grounded = confirmed.has(item.verificationStatus) && item.sourceTitle?.trim() && item.sourceUrl?.trim() && item.sourceCheckedAt?.trim() && ["phrase", "reading", "meaning", "region", "example", "usage"].every((scope) => scopes.has(scope));
  if (grounded && item.description?.trim().length >= 100 && item.description.trim().length <= 160 && item.exampleDialect?.trim() && item.exampleStandard?.trim()) return "indexable";
  if (item.phrase?.trim() && item.standardJapanese?.trim() && item.description?.trim()) return "review_required";
  return "noindex";
};
const normalized = (value) => value.normalize("NFKC").toLowerCase().replace(/[\s、。！？・]/g, "");
const duplicateGroups = (field) => {
  const groups = new Map();
  for (const item of dialects) {
    const key = normalized(item[field] ?? "");
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), item.id]);
  }
  return [...groups.values()].filter((ids) => ids.length > 1);
};
const counts = { indexable: 0, review_required: 0, noindex: 0 };
for (const item of dialects) counts[classify(item)] += 1;
const sourced = dialects.filter((item) => item.sourceTitle && item.sourceUrl && item.sourceCheckedAt);
const scopeCounts = Object.fromEntries(
  ["phrase", "reading", "meaning", "region", "example", "usage", "history"].map((scope) => [
    scope,
    dialects.filter((item) => [item.evidenceScopes ?? [], ...(item.additionalSources ?? []).map((source) => source.evidenceScopes ?? [])].flat().includes(scope)).length,
  ]),
);
const report = {
  generatedAt: new Date().toISOString(),
  dialectRecords: dialects.length,
  ...counts,
  fullyIndexableRate: `${Math.round((counts.indexable / Math.max(dialects.length, 1)) * 100)}%`,
  recordsWithSourceMetadata: sourced.length,
  sourceMetadataRate: `${Math.round((sourced.length / Math.max(dialects.length, 1)) * 100)}%`,
  evidenceScopeCounts: scopeCounts,
  duplicatePhraseGroups: duplicateGroups("phrase"),
  duplicateDescriptionGroups: duplicateGroups("description"),
  policy: "根拠・確認日・十分な固有本文・例文が揃った記事のみindexable",
};
console.log(JSON.stringify(report, null, 2));
await mkdir(join(root, "reports"), { recursive: true });
await writeFile(join(root, "reports/seo-content-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
