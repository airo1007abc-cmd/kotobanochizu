import { isIndexableRecord } from "../src/evidencePolicy.mjs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dialectDir = join(root, "src/data/dialects");
const files = (await readdir(dialectDir)).filter((file) => file.endsWith(".json"));
const dialects = (await Promise.all(files.map(async (file) => JSON.parse(await readFile(join(dialectDir, file), "utf8"))))).flat();
const classify = item => isIndexableRecord(item) ? 'indexable' : item.phrase?.trim() && item.standardJapanese?.trim() && item.description?.trim() ? 'review_required' : 'noindex';
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
  policy: "公開可能な確認状態と有効な出典metadataに加え、語形・意味・地域・読み・例文・用法のclaim-level evidence、100字以上の説明、方言例文と標準語訳が揃った記事をindexableとする。未完了記事は公開・回遊可能なままnoindex,followとする",
};
console.log(JSON.stringify(report, null, 2));
await mkdir(join(root, "reports"), { recursive: true });
await writeFile(join(root, "reports/seo-content-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
