import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => fs.writeFileSync(path.join(root, file), `${typeof value === "string" ? value : JSON.stringify(value, null, 2)}\n`);
const priority = read("reports/dialect-content-priority.json");
const raws = fs.readdirSync(path.join(root, "src/data/dialects")).filter((file) => file.endsWith(".json")).flatMap((file) => read(`src/data/dialects/${file}`));
const rawById = new Map(raws.map((item) => [item.id, item]));
const candidates = priority.records.filter((record) => record.nextActions.includes("candidate_for_index"));
const source = (raw) => raw ? {
  title: raw.sourceTitle ?? null, organization: raw.sourceOrganization ?? null,
  url: raw.sourceUrl ?? null, sourceTier: raw.sourceTier ?? (/ninjal|\.go\.jp|\.lg\.jp|\.ac\.jp/.test(raw.sourceUrl ?? "") ? 1 : 3),
  exactFormMatch: raw.sourceExactFormMatch ?? "exact", evidenceScopes: raw.evidenceScopes ?? [],
} : null;

const promotionPages = candidates.map((record) => {
  const raw = rawById.get(record.id);
  const evidence = source(raw);
  const accentOnly = record.id.startsWith("jp-35-yamaguchi-04") || record.id === "jp-35-yamaguchi-050" || record.id === "jp-35-yamaguchi-051";
  const ready = raw?.confidence === "medium" && raw?.exampleDialect && !/確認|収集中/.test(raw.exampleDialect);
  const decision = accentOnly ? "HOLD" : ready ? "READY" : evidence?.url ? "NEAR_READY" : "NOT_READY";
  const remaining = decision === "READY" ? [] : accentOnly
    ? ["アクセント資料が語形を裏付けても、標準語と同形の語を独立方言ページにする固有価値の編集判断"]
    : ["登録資料の該当箇所再確認", ...(record.hasExample ? [] : ["source_attested用例または例文なしでも独立価値があるかの編集確認"])];
  return {
    id: record.id, word: record.word, prefecture: record.prefecture, region: record.region,
    indexStatus: record.indexStatus, currentIssues: record.issues, currentMeaning: record.meaning,
    source: evidence, sourceCount: record.sourceCount, hasReading: record.hasReading, hasExample: record.hasExample,
    decision, evidenceAssessment: evidence?.url ? "登録済み資料あり。資料のauthorityとrecordの語形・意味・地域の対応を再評価。" : "信頼資料未登録。",
    uniquenessAssessment: accentOnly ? "標準語と同形で、現状の固有情報はアクセント資料に依存。" : "地域・意味・出典を持つ独立レコード候補。",
    duplicateRisk: record.duplicateSeoGroup.length ? "review_required" : "none_detected",
    requiredProductionChanges: [], remainingChecks: remaining,
  };
});
const promotionCounts = Object.fromEntries(["READY", "NEAR_READY", "NOT_READY", "HOLD"].map((key) => [key, promotionPages.filter((page) => page.decision === key).length]));
const promotion = { generatedAt: "2026-09-04", productionIndexChanged: false, methodology: "登録済み一次・学術資料と現行claimの対応を編集監査。検索順位や言語学的正確性の断定ではない。", summary: { total: promotionPages.length, ...promotionCounts }, pages: promotionPages };
write("reports/dialect-index-promotion-review.json", promotion);
write("reports/dialect-index-promotion-review.md", ["# noindex → index候補31件の監査", "", "index変更: **なし**", "", `READY ${promotionCounts.READY} / NEAR_READY ${promotionCounts.NEAR_READY} / NOT_READY ${promotionCounts.NOT_READY} / HOLD ${promotionCounts.HOLD}`, "", ...promotionPages.flatMap((page) => [`## ${page.word}（${page.id}）— ${page.decision}`, "", `- ${page.prefecture}・${page.region}`, `- 現在の不足: ${page.currentIssues.join("、")}`, `- 資料: ${page.source?.title ?? "未登録"}`, `- 固有性: ${page.uniquenessAssessment}`, `- 残作業: ${page.remainingChecks.join("、") || "index変更について人間承認のみ"}`, ""] )].join("\n"));

const missing = priority.records.filter((record) => record.issues.includes("missing_source"));
const missingPages = missing.map((record) => {
  const gifuEvidence = record.id === "jp-21-gifu-001" ? [{ title: "岐阜県公開資料内の使用例", organization: "岐阜県", url: "https://www.pref.gifu.lg.jp/uploaded/attachment/411966.pdf", sourceTier: 1, exactFormMatch: "exact", supports: ["語形", "『大変』に近い文脈上の用法"] }] : [];
  return {
    id: record.id, word: record.word, prefecture: record.prefecture, region: record.region,
    currentMeaning: record.meaning, indexStatus: record.indexStatus,
    decision: gifuEvidence.length ? "PARTIAL" : "NOT_FOUND", evidence: gifuEvidence,
    verified: gifuEvidence.length ? ["語形", "使用文脈"] : [], unresolved: gifuEvidence.length ? ["地域分布", "読みの資料上の明示", "辞書的意味の直接定義"] : ["語形", "意味", "地域", "出典"],
    note: gifuEvidence.length ? "公的資料に用例はあるが、辞書的定義・分布を確定するには不足。" : "リポジトリ登録資料および今回の公的Web探索で確定資料を得られず。推測追加しない。",
  };
});
const missingCounts = Object.fromEntries(["SOURCE_FOUND", "PARTIAL", "NOT_FOUND", "CONFLICT"].map((key) => [key, missingPages.filter((page) => page.decision === key).length]));
write("reports/dialect-missing-source-review.json", { generatedAt: "2026-09-04", productionDataChanged: false, summary: { total: missingPages.length, ...missingCounts }, pages: missingPages });
write("reports/dialect-missing-source-review.md", ["# 出典なし27件の監査", "", `SOURCE_FOUND ${missingCounts.SOURCE_FOUND} / PARTIAL ${missingCounts.PARTIAL} / NOT_FOUND ${missingCounts.NOT_FOUND} / CONFLICT ${missingCounts.CONFLICT}`, "", ...missingPages.map((page) => `- **${page.word}**（${page.id}）: ${page.decision} — ${page.note}`)].join("\n"));

const duplicatePages = priority.records.filter((record) => record.qualityGrade === "D");
const groups = new Map();
for (const page of duplicatePages) {
  const group = `${page.prefecture}|${page.region}|${page.word}`;
  if (!groups.has(group)) groups.set(group, []);
  groups.get(group).push(page);
}
const duplicateGroups = [...groups.values()].map((pages, index) => {
  const uniqueIds = [...new Map(pages.map((page) => [page.id, page])).values()];
  const groupId = `content-duplicate-${String(index + 1).padStart(2, "0")}`;
  const words = new Set(uniqueIds.map((page) => page.word));
  const meanings = new Set(uniqueIds.map((page) => page.meaning));
  const regions = new Set(uniqueIds.map((page) => `${page.prefecture}/${page.region}`));
  const classification = words.size === 1 && meanings.size === 1 && regions.size === 1 ? "TRUE_DUPLICATE"
    : words.size === 1 && meanings.size > 1 ? "SAME_FORM_DIFFERENT_MEANING"
    : regions.size > 1 ? "REGIONAL_VARIANT" : "SEO_TEMPLATE_COLLISION";
  return {
    groupId, classification, pages: uniqueIds.map((page) => ({ id: page.id, word: page.word, meaning: page.meaning, prefecture: page.prefecture, region: page.region, title: page.seoTitle, description: page.seoDescription })),
    proposal: classification === "TRUE_DUPLICATE" ? { mergeCandidate: true, canonicalCandidate: true, redirectCandidate: true, action: "原資料・例文・ID参照を人間確認してから代表URLを決定" }
      : { mergeCandidate: false, canonicalCandidate: false, redirectCandidate: false, action: "意味差を本文とSEO titleで明示し、独立レコードを維持する方向で確認" },
  };
});
const duplicateCounts = Object.fromEntries(["TRUE_DUPLICATE", "REGIONAL_VARIANT", "SAME_FORM_DIFFERENT_MEANING", "SEO_TEMPLATE_COLLISION", "UNCERTAIN"].map((key) => [key, duplicateGroups.filter((group) => group.classification === key).length]));
write("reports/dialect-duplicate-review.json", { generatedAt: "2026-09-04", productionDataChanged: false, summary: { pages: duplicatePages.length, groups: duplicateGroups.length, ...duplicateCounts }, groups: duplicateGroups });
write("reports/dialect-duplicate-review.md", ["# 重複候補40ページの監査", "", `対象 ${duplicatePages.length}ページ / ${duplicateGroups.length}グループ`, "", ...duplicateGroups.flatMap((group) => [`## ${group.groupId} — ${group.classification}`, "", ...group.pages.map((page) => `- ${page.id}: ${page.word}／${page.meaning}／${page.prefecture}・${page.region}`), `- proposal: ${group.proposal.action}`, ""])].join("\n"));

const batch3 = read("reports/dialect-research-batch-3.json");
const mu = batch3.pages.find((page) => page.id === "jp-47-okinawa-002");
write("reports/mu-entry-split-review.md", ["# 「ムﾟー」同形別義・entry split監査", "", "判定: **HOLD / SPLIT_ENTRY候補**（今回は分割しない）", "", `- 現在の語形: ${mu.word}`, `- 現在の意味: ${mu.currentData.meaning}`, `- 現在の地域: ${mu.currentData.region}・${mu.currentData.municipality}`, "- 資料上の同形候補: 芋（名詞）／熟れる（動詞）／紡ぐ（動詞）", "- exactFormMatch: exact（資料表記上）。ただし品詞・意味が異なるため同一entryには統合しない。", "", "## 分割前に必要な確認", "", "- 各意味の読み・アクセントと用例", "- 各意味の地域分布", "- 現在の『芋』ページが保持すべき出典範囲", "- 新規ID・slug・canonicalと旧URLの扱い", "- 関連語・地域一覧・内部リンクの更新範囲", "", "現時点ではURL変更、canonical変更、レコード追加、分割を行わない。"].join("\n"));

console.log(JSON.stringify({ promotion: promotion.summary, missingSource: { total: missingPages.length, ...missingCounts }, duplicates: { pages: duplicatePages.length, groups: duplicateGroups.length, ...duplicateCounts } }, null, 2));
