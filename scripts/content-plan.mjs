import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dialectFiles = (await readdir(join(root, "src/data/dialects"))).filter((file) => file.endsWith(".json")).sort();
const dialectRecords = (await Promise.all(dialectFiles.map(async (file) => JSON.parse(await readFile(join(root, "src/data/dialects", file), "utf8"))))).flat();
const meaningRecords = JSON.parse(
  await readFile(join(root, "src/data/meaning-comparisons.json"), "utf8"),
);
const regionGuideRecords = JSON.parse(
  await readFile(join(root, "src/data/region-guides.json"), "utf8"),
);
const cultureGuideRecords = JSON.parse(
  await readFile(join(root, "src/data/culture-guides.json"), "utf8"),
);
const contextGuideRecords = JSON.parse(
  await readFile(join(root, "src/data/context-guides.json"), "utf8"),
);
const confirmed = new Set(["verified", "reference_confirmed", "community_confirmed"]);
const classify = (item) => {
  const scopes = new Set([...(item.evidenceScopes ?? []), ...(item.additionalSources ?? []).flatMap((source) => source.evidenceScopes ?? [])]);
  const grounded = confirmed.has(item.verificationStatus) && item.sourceTitle?.trim() && item.sourceUrl?.trim() && item.sourceCheckedAt?.trim() && ["phrase", "reading", "meaning", "region", "example", "usage"].every((scope) => scopes.has(scope));
  if (grounded && item.description?.trim().length >= 100 && item.description.trim().length <= 160 && item.exampleDialect?.trim() && item.exampleStandard?.trim()) return "indexable";
  if (item.phrase?.trim() && item.standardJapanese?.trim() && item.description?.trim()) return "review_required";
  return "noindex";
};

const categories = [
  ["dialect", 600, "/dialects/research-", "方言・地域語の個別解説"],
  ["meaning", 150, "/meanings/research-", "標準語から各地方の言い方を比較"],
  ["region", 150, "/guides/regions/research-", "地域ガイド"],
  ["culture", 70, "/guides/culture/research-", "文化・歴史・発音・場面"],
  ["context", 30, "/stories/research-", "会話・昔話・インタビュー"],
];
const entries = categories.flatMap(([category, count, prefix, label]) =>
  Array.from({ length: count }, (_, index) => {
    const existing = category === "dialect" ? dialectRecords[index] : category === "meaning" ? meaningRecords[index] : category === "region" ? regionGuideRecords[index] : category === "culture" ? cultureGuideRecords[index] : category === "context" ? contextGuideRecords[index] : undefined;
    const indexStatus = existing ? (category === "dialect" ? classify(existing) : existing.indexStatus) : "noindex";
    return {
      planId: `${category}-${String(index + 1).padStart(3, "0")}`,
      category,
      contentId: existing?.id ?? null,
      targetUrl: existing ? category === "dialect" ? `/dialects/${existing.slug}` : category === "meaning" ? `/meanings/${existing.slug}` : category === "region" ? `/guides/regions/${existing.slug}` : category === "culture" ? `/guides/culture/${existing.slug}` : `/stories/${existing.slug}` : `${prefix}${String(index + 1).padStart(3, "0")}`,
      searchIntent: existing ? (category === "dialect" ? `「${existing.phrase}」の意味・使い方・使用地域を知りたい` : existing.searchIntent) : null,
      workingTitle: existing ? (category === "dialect" ? `${existing.phrase}とは？意味・使い方・使用地域` : existing.title) : null,
      requiredEvidence: category === "dialect" ? ["表記・読み", "意味", "使用地域", "自然な実例", "用法", "出典", "確認日"] : ["固有の検索意図", "根拠資料", "独自本文"],
      status: existing ? (indexStatus === "indexable" ? "quality_gate_passed" : "evidence_review") : "research_backlog",
      indexStatus,
      note: existing ? "既存ページを1,000ページ計画内に算入。品質ゲートの判定に同期する。" : `${label}。検索意図と根拠の確定前はページを生成しない。`,
    };
  }),
);

await mkdir(join(root, "content"), { recursive: true });
await writeFile(join(root, "content/seo-content-plan.json"), `${JSON.stringify({ version: 2, target: 1000, existingIncluded: true, entries }, null, 2)}\n`);

const sampleRank = (item) => {
  const indexStatus = classify(item);
  if (indexStatus === "indexable") return 0;
  if (item.sourceUrl) return 1;
  return 2;
};
const rankedDialects = [...dialectRecords].sort((left, right) => sampleRank(left) - sampleRank(right) || left.id.localeCompare(right.id, "ja"));
const sampleCandidates = [...rankedDialects, ...Array.from({ length: Math.max(0, 50 - rankedDialects.length) }, (_, index) => ({ id: `sample-research-${String(index + 1).padStart(2, "0")}` }))].slice(0, 50);
const firstSample = sampleCandidates.map((item, index) => {
  const isExisting = Boolean(item.phrase);
  const indexStatus = isExisting ? classify(item) : "noindex";
  return {
    sampleOrder: index + 1,
    contentId: item.id,
    phrase: item.phrase ?? null,
    prefectureName: item.prefectureName ?? null,
    sourceStatus: !isExisting ? "research_required" : indexStatus === "indexable" ? "evidence_complete" : item.sourceUrl ? "partial_source_found" : "research_required",
    verifiedScopes: item.evidenceScopes ?? [],
    requiredChecks: ["固有の検索意図", "一次または信頼できる資料", "表記・読み・意味・地域の一致", "100〜160字の固有要約", "自然な例文の権利と真正性", "関連ページ2件以上", "編集者による最終確認"],
    status: indexStatus === "indexable" ? "quality_gate_passed" : "evidence_review",
    indexStatus,
  };
});
await writeFile(join(root, "content/quality-sample-50.json"), `${JSON.stringify({ version: 3, target: 50, cohortRule: "品質ゲート合格済みを優先し、次に公的出典登録済み候補を選ぶ", policy: "全項目を満たすまでindexableにしない", entries: firstSample }, null, 2)}\n`);
console.log(`planned ${entries.length} evidence-gated content slots (${dialectRecords.length + meaningRecords.length + regionGuideRecords.length + cultureGuideRecords.length + contextGuideRecords.length} existing pages included)`);
console.log(`generated ${firstSample.length} quality sample entries`);
