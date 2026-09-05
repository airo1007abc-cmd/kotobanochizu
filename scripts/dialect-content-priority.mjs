import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const reportsDir = join(root, "reports");
const missingTokens = new Set(["", "unknown", "null", "undefined", "未記録"]);
const text = (value) => typeof value === "string" && !missingTokens.has(value.trim().toLowerCase()) ? value.trim() : "";
const normalize = (value) => text(value).normalize("NFKC").toLowerCase().replace(/[\s　・ー]/g, "").replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const dialectFiles = (await readdir(join(root, "src/data/dialects"))).filter((file) => file.endsWith(".json"));
const nationalDialects = (await Promise.all(dialectFiles.map(async (file) => JSON.parse(await readFile(join(root, "src/data/dialects", file), "utf8"))))).flat();

// Match repository.ts without importing production TypeScript from Node.
const quoted = '"((?:[^"\\\\]|\\\\.)*)"';
const parseQuoted = (value) => JSON.parse(`"${value}"`);
const baseSource = await readFile(join(root, "src/data.ts"), "utf8");
const extendedSource = await readFile(join(root, "src/extendedData.ts"), "utf8");
const basePattern = new RegExp(`base\\(\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted}`, "g");
const seedPattern = new RegExp(`\\[\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted},\\s*${quoted}\\s*,?\\s*\\]`, "g");
const legacyFromMatch = (match) => ({
  id: parseQuoted(match[1]), phrase: parseQuoted(match[2]), reading: parseQuoted(match[3]),
  standardJapanese: parseQuoted(match[4]), description: parseQuoted(match[5]),
  exampleDialect: parseQuoted(match[6]), exampleStandard: parseQuoted(match[7]),
  prefectureName: parseQuoted(match[8]), regionName: parseQuoted(match[9]),
  verificationStatus: "demo_candidate", evidenceScopes: [], additionalSources: [],
});
const rawLegacy = [
  ...[...baseSource.matchAll(basePattern)].map(legacyFromMatch),
  ...[...extendedSource.slice(extendedSource.indexOf("const seeds"), extendedSource.indexOf("export const moreDialects")).matchAll(seedPattern)].map(legacyFromMatch),
];
const nationalPhraseKeys = new Set(nationalDialects.map((item) => `${item.prefectureName}|${normalize(item.phrase)}`));
const replacedLegacyIds = new Set(["d1", "d2", "d8", "d9", "d10", "d11", "d12", "d13"]);
const legacyDialects = rawLegacy.filter((item) => !replacedLegacyIds.has(item.id) && !nationalPhraseKeys.has(`${item.prefectureName}|${normalize(item.phrase)}`));
const dialects = [...legacyDialects, ...nationalDialects];

const priorAudit = JSON.parse(await readFile(join(reportsDir, "dialect-v2-content-audit.json"), "utf8"));
const seoAudit = JSON.parse(await readFile(join(reportsDir, "seo-site-audit.json"), "utf8"));
const idsFromPaths = (paths) => paths.map((path) => path.split("/").filter(Boolean).at(-1));
const titleGroups = seoAudit.duplicateTitles.map((group, index) => ({ key: `title-${index + 1}`, type: "title", value: group.value, ids: idsFromPaths(group.paths) }));
const descriptionGroups = seoAudit.duplicateDescriptions.map((group, index) => ({ key: `description-${index + 1}`, type: "description", value: group.value, ids: idsFromPaths(group.paths) }));
const seoGroups = [...titleGroups, ...descriptionGroups];
const duplicateGroupsById = new Map();
for (const group of seoGroups) for (const id of group.ids) duplicateGroupsById.set(id, [...(duplicateGroupsById.get(id) ?? []), group.key]);

const indexStatusFor = async (id) => {
  const html = await readFile(join(root, "dist/dialects", id, "index.html"), "utf8").catch(() => "");
  return html.includes('name="robots" content="index,follow"') ? "indexable" : "noindex";
};
const indexedStatuses = new Map(await Promise.all(dialects.map(async (item) => [item.id, await indexStatusFor(item.id)])));

const sourceCount = (item) => (text(item.sourceTitle) || text(item.source?.title) || text(item.sourceUrl) || text(item.source?.url) ? 1 : 0) + (Array.isArray(item.additionalSources) ? item.additionalSources.filter((source) => text(source?.title) || text(source?.url) || text(source?.organization)).length : 0);
const evidenceScopes = (item) => [...new Set([...(item.evidenceScopes ?? item.source?.evidenceScopes ?? []), ...(item.additionalSources ?? []).flatMap((source) => source?.evidenceScopes ?? [])])];
const hasExample = (item) => Boolean(text(item.exampleDialect) && text(item.exampleStandard));
const confirmedStatuses = new Set(["verified", "reference_confirmed", "community_confirmed"]);

const baseRows = await Promise.all(dialects.map(async (item) => {
  const indexStatus = indexedStatuses.get(item.id) ?? "noindex";
  const sources = sourceCount(item);
  const reading = Boolean(text(item.reading));
  const example = hasExample(item);
  const descriptionLength = text(item.description).length;
  const scopes = evidenceScopes(item);
  const duplicateSeoGroup = duplicateGroupsById.get(item.id) ?? [];
  const coreEvidenceConfirmed = ["phrase", "meaning", "region"].every((scope) => scopes.includes(scope));
  const issues = [
    !reading && "missing_reading",
    !example && "missing_example",
    sources === 0 && "missing_source",
    !text(item.description) && "missing_description",
    sources > 0 && !coreEvidenceConfirmed && "core_evidence_scope_incomplete",
    duplicateSeoGroup.length > 0 && "duplicate_seo",
  ].filter(Boolean);
  return {
    id: item.id,
    word: text(item.phrase),
    prefecture: text(item.prefectureName),
    region: text(item.regionName),
    municipality: text(item.municipality),
    indexStatus,
    meaning: text(item.standardJapanese),
    description: text(item.description),
    verificationStatus: item.verificationStatus ?? "",
    evidenceScopes: scopes,
    sourceCount: sources,
    hasReading: reading,
    hasExample: example,
    duplicateSeoGroup,
    issues,
    descriptionLength,
    coreEvidenceConfirmed,
    raw: item,
  };
}));

// Exact-content clusters are candidates only; they are never treated as proven linguistic duplicates.
const exactContentGroups = new Map();
for (const row of baseRows) {
  const key = `${normalize(row.word)}|${normalize(row.meaning)}|${normalize(row.description)}`;
  exactContentGroups.set(key, [...(exactContentGroups.get(key) ?? []), row.id]);
}
const similarIds = new Set([...exactContentGroups.values()].filter((ids) => ids.length > 1).flat());

const records = baseRows.map((row) => {
  const duplicateCandidate = row.duplicateSeoGroup.length > 0 || similarIds.has(row.id);
  if (similarIds.has(row.id) && !row.issues.includes("possible_content_duplicate")) row.issues.push("possible_content_duplicate");
  const majorMissing = Number(!row.hasReading) + Number(!row.hasExample) + Number(row.sourceCount === 0);
  let qualityGrade;
  if (duplicateCandidate) qualityGrade = "D";
  else if (row.indexStatus === "noindex" && (row.sourceCount === 0 || majorMissing >= 2 || !confirmedStatuses.has(row.verificationStatus))) qualityGrade = "E";
  else if (row.sourceCount === 0 || majorMissing >= 2) qualityGrade = "C";
  else if (row.indexStatus === "indexable" && row.hasReading && row.hasExample && row.sourceCount > 0 && row.coreEvidenceConfirmed && confirmedStatuses.has(row.verificationStatus) && row.description) qualityGrade = "A";
  else qualityGrade = "B";

  const candidateForIndex = row.indexStatus === "noindex" && row.sourceCount > 0 && row.hasReading && row.description && row.meaning && row.region && row.coreEvidenceConfirmed && row.issues.every((issue) => ["missing_example"].includes(issue));
  const keepNoindex = row.indexStatus === "noindex" && !candidateForIndex;
  if (candidateForIndex && row.issues.length === 0) row.issues.push("publication_basis_review");
  let priority;
  if (row.indexStatus === "indexable" && (row.sourceCount === 0 || duplicateCandidate)) priority = "P0";
  else if (row.indexStatus === "indexable" && qualityGrade !== "A") priority = "P1";
  else if (row.indexStatus === "noindex" && (row.sourceCount === 0 || candidateForIndex || ["C", "D"].includes(qualityGrade))) priority = "P2";
  else priority = "P3";

  const nextActions = [
    row.sourceCount === 0 && "source_research",
    !row.hasReading && "reading_verification",
    !row.hasExample && "example_research",
    duplicateCandidate && "duplicate_review",
    row.duplicateSeoGroup.length > 0 && "seo_metadata_review",
    candidateForIndex && "candidate_for_index",
    keepNoindex && "keep_noindex",
    qualityGrade === "A" && "manual_editor_review",
  ].filter(Boolean);
  if (nextActions.length === 0) nextActions.push("manual_editor_review");
  const notes = [
    duplicateCandidate && "重複は文字列・SEO一致に基づく候補であり、統合には地域差と原資料の人間確認が必要。",
    row.sourceCount === 0 && "記録済み出典がないため、資料確認まで根拠を補完しない。",
    candidateForIndex && (row.hasExample
      ? "表示項目は揃っているが、公開根拠・確認状態の編集審査が必要なindex候補。公開状態は未変更。"
      : "例文と公開根拠・確認状態の資料確認後に再判定するindex候補。公開状態は未変更。"),
    keepNoindex && "現時点ではnoindex維持を推奨。",
  ].filter(Boolean).join(" ");
  const { raw: _raw, descriptionLength: _descriptionLength, coreEvidenceConfirmed: _coreEvidenceConfirmed, ...publicRow } = row;
  return { ...publicRow, qualityGrade, priority, nextActions, candidateForIndex: Boolean(candidateForIndex), keepNoindex: Boolean(keepNoindex), notes };
});

const countBy = (items, key, values) => Object.fromEntries(values.map((value) => [value, items.filter((item) => item[key] === value).length]));
const qualityValues = ["A", "B", "C", "D", "E"];
const priorityValues = ["P0", "P1", "P2", "P3"];
const sourceMissingRecords = records.filter((row) => row.sourceCount === 0).map((row) => ({
  id: row.id, word: row.word, prefecture: row.prefecture, region: row.region,
  indexStatus: row.indexStatus, meaning: row.meaning, description: row.description,
  verificationStatus: row.verificationStatus, evidenceScopes: row.evidenceScopes,
  reason: "記録済み出典がなく、意味・読み・地域・用例の根拠を資料から確認できないため。",
}));

const dialectById = new Map(dialects.map((item) => [item.id, item]));
const seoDuplicateAnalysis = seoGroups.map((group) => {
  const items = group.ids.map((id) => dialectById.get(id)).filter(Boolean);
  const sameWord = new Set(items.map((item) => normalize(item.phrase))).size === 1;
  const sameRegion = new Set(items.map((item) => `${item.prefectureName}|${item.regionName}|${item.municipality ?? ""}`)).size === 1;
  const sameMeaning = new Set(items.map((item) => normalize(item.standardJapanese))).size === 1;
  const category = sameWord && sameRegion && sameMeaning
    ? "probable_record_duplicate"
    : sameWord && !sameRegion
      ? "regional_variant_needs_differentiation"
      : group.type === "description"
        ? "description_template_collision"
        : "title_template_collision";
  return {
    ...group,
    category,
    recommendedReview: category === "probable_record_duplicate" ? "content_merge_review" : "seo_metadata_and_content_differentiation_review",
    note: "自動判定は文字列一致のみ。統合・別ページ維持は原資料と地域差を人間が確認して決定する。",
  };
});

const summary = {
  total: records.length,
  expectedTotal: 1643,
  indexable: records.filter((row) => row.indexStatus === "indexable").length,
  noindex: records.filter((row) => row.indexStatus === "noindex").length,
  quality: countBy(records, "qualityGrade", qualityValues),
  priority: countBy(records, "priority", priorityValues),
  indexableQuality: countBy(records.filter((row) => row.indexStatus === "indexable"), "qualityGrade", qualityValues),
  noindexQuality: countBy(records.filter((row) => row.indexStatus === "noindex"), "qualityGrade", qualityValues),
  sourceMissing: sourceMissingRecords.length,
  duplicateTitleGroups: titleGroups.length,
  duplicateDescriptionGroups: descriptionGroups.length,
  indexPromotionCandidates: records.filter((row) => row.candidateForIndex).length,
  keepNoindexRecommended: records.filter((row) => row.keepNoindex).length,
  priorAuditCounts: priorAudit.warnings,
  methodology: "編集作業の優先順位を決めるための機械分類。言語学的正確性・統合可否・index適格性の最終判断ではない。",
};

const priorityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
const issueWeight = (row) =>
  Number(row.issues.includes("missing_source")) * 100 +
  Number(row.issues.includes("duplicate_seo")) * 90 +
  Number(row.issues.includes("possible_content_duplicate")) * 80 +
  Number(row.issues.includes("missing_reading")) * 40 +
  Number(row.issues.includes("missing_example")) * 30 +
  Number(row.issues.includes("missing_description")) * 20 +
  Number(row.issues.includes("core_evidence_scope_incomplete")) * 15;
const rankedRecords = [...records].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || issueWeight(b) - issueWeight(a) || a.id.localeCompare(b.id, "ja"));
const topQueueRows = [];
const topQueuePrefectureCounts = new Map();
for (const row of rankedRecords) {
  if ((topQueuePrefectureCounts.get(row.prefecture) ?? 0) >= 2) continue;
  topQueueRows.push(row);
  topQueuePrefectureCounts.set(row.prefecture, (topQueuePrefectureCounts.get(row.prefecture) ?? 0) + 1);
  if (topQueueRows.length === 20) break;
}
for (const row of rankedRecords) {
  if (topQueueRows.length === 20) break;
  if (!topQueueRows.includes(row)) topQueueRows.push(row);
}
const topQueue = topQueueRows.map(({ id, word, prefecture, region, indexStatus, qualityGrade, priority, issues, nextActions }) => ({ id, word, prefecture, region, indexStatus, qualityGrade, priority, issues, nextActions }));

if (records.length !== 1643 || summary.indexable !== 630 || summary.noindex !== 1013 || sourceMissingRecords.length !== 27) {
  throw new Error(`監査母数が期待値と不一致: ${JSON.stringify({ total: records.length, indexable: summary.indexable, noindex: summary.noindex, sourceMissing: sourceMissingRecords.length })}`);
}

const report = { generatedAt: new Date().toISOString(), summary, topQueue, seoDuplicateAnalysis, sourceMissingRecords, records };
await mkdir(reportsDir, { recursive: true });
await writeFile(join(reportsDir, "dialect-content-priority.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
const columns = ["id", "word", "prefecture", "region", "indexStatus", "qualityGrade", "priority", "issues", "nextActions", "sourceCount", "hasReading", "hasExample", "duplicateSeoGroup", "notes"];
const csv = [columns.map(csvCell).join(","), ...records.map((row) => columns.map((key) => csvCell(Array.isArray(row[key]) ? row[key].join("|") : row[key])).join(","))].join("\n");
await writeFile(join(reportsDir, "dialect-content-priority.csv"), `\uFEFF${csv}\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
