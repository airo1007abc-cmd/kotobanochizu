import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const priority = read("reports/dialect-content-priority.json").records;

const excluded = new Set([
  "jp-46-kagoshima-022", "jp-46-kagoshima-049", "jp-06-yamagata-001", "jp-05-akita-001", "jp-05-akita-002",
  "jp-16-toyama-001", "jp-24-mie-001", "jp-47-okinawa-001", "jp-35-yamaguchi-002",
  ...read("reports/dialect-research-batch-2-candidates.json").candidates.map((item) => item.id),
  ...read("reports/dialect-research-batch-3-candidates.json").candidates.map((item) => item.id),
]);

const scored = priority
  .filter((record) => record.priority === "P1" && record.indexStatus === "indexable" && !excluded.has(record.id))
  .map((record) => {
    const descriptionGap = record.description.length < 100 ? 25 : record.description.length < 140 ? 18 : 8;
    const sourcePotential = record.sourceCount > 0 ? 20 : 6;
    const ambiguity = Math.min(20, record.issues.length * 6);
    const uniquePotential = record.hasExample ? 12 : 18;
    return { ...record, score: Math.min(100, 25 + descriptionGap + sourcePotential + ambiguity + uniquePotential) };
  })
  .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

const selected = [];
const prefectureCount = new Map();
for (const maxPerPrefecture of [1, 2, 3, 4]) {
  for (const record of scored) {
    if (selected.length >= 40) break;
    if (selected.some((item) => item.id === record.id)) continue;
    if ((prefectureCount.get(record.prefecture) ?? 0) >= maxPerPrefecture) continue;
    selected.push(record);
    prefectureCount.set(record.prefecture, (prefectureCount.get(record.prefecture) ?? 0) + 1);
  }
}

const candidates = selected.map((record) => ({
  id: record.id,
  word: record.word,
  prefecture: record.prefecture,
  currentQuality: record.qualityGrade,
  currentIssues: record.issues,
  researchPotential: record.sourceCount > 0 ? "high" : "medium",
  editorialImpact: record.score,
  selectionReason: `indexable/P1。説明${record.description.length}文字、出典${record.sourceCount}件。第1〜3バッチとResolution Batchを除外し、${record.issues.join("・")}をclaim単位で確認する候補。`,
}));

const output = {
  generatedAt: "2026-09-04",
  status: "selection_only_research_not_started",
  count: candidates.length,
  safeguards: [
    "第1〜3バッチとResolution Batchの対象を除外",
    "indexable/P1を優先",
    "都道府県の偏りを抑制",
    "検索需要は推測しない",
    "本番データは変更しない",
  ],
  candidates,
};
fs.writeFileSync(path.join(root, "reports/dialect-research-batch-4-candidates.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ count: candidates.length, prefectures: prefectureCount.size }, null, 2));
