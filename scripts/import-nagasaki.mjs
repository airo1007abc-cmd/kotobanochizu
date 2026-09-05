import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const input = JSON.parse(
  await readFile(new URL("research/nagasaki/public-candidates.raw.json", root), "utf8"),
);
const existing = JSON.parse(
  await readFile(new URL("src/data/dialects/nagasaki.json", root), "utf8"),
);

const supportedScopes = new Set([
  "phrase",
  "reading",
  "meaning",
  "region",
  "example",
  "usage",
  "history",
]);

const primaryRegion = {
  "県南・五島": "五島",
  "県央・五島": "県央",
  "県央・県北": "県央",
};

const contextFor = (item) => {
  if (["アゴ", "カットッポ", "ガゼ", "カンコロ", "カタシ", "コーコイモ"].includes(item.phrase))
    return ["食・生業・地域文化"];
  if (["ツジ", "カワ", "タキ", "春一番"].includes(item.phrase))
    return ["地名・自然・地域文化"];
  return ["日常会話"];
};

const splitUrls = (value = "") => value
  .split(/\s*;\s*/)
  .map((url) => url.trim())
  .filter(Boolean);

const descriptionFor = (item, region) => {
  const place = item.locality || item.municipality || `長崎県${region}`;
  const limitation = item.exampleDialect?.trim()
    ? "掲載用例も同じ資料で確認していますが、現在の使用頻度や世代差は追加調査中です。"
    : "語形・意味・地域は資料で確認し、自然な会話用例、現在の使用頻度、世代差は追加調査中です。";
  return `「${item.phrase}」は、${place}のことばとして資料「${item.sourceTitle}」に収録され、標準語の「${item.standardJapanese}」にあたると説明されています。${limitation}`;
};

const batten = {
  ...existing[0],
  description: "長崎市の「ばってん」は、「しかし」「だが」に近い意味で文や句をつなぐ表現です。長崎市の記事では長崎弁の代表的な語として紹介される一方、若い世代では使用が減っているとも記録されています。地域・世代による現在の使用差は追加確認中です。",
  exampleDialect: "ばってん、そいとにまた来てしもうたと。",
  exampleStandard: "でも、それなのにまた来てしまったわ。",
  ageGroups: ["unknown"],
  usageContexts: ["前の内容を受けて逆接を示す場面", "日常会話"],
  usageFrequency: "unknown",
  verificationStatus: "reference_confirmed",
  sourceNote: "長崎市の記事本文の会話と対訳、ワンポイント解説を確認。『しかし』『だが』の意味合いを持つ接続詞・接続助詞として一般的に使うと説明され、若い人はあまり使わなくなっているとの記述もある。県南全域の分布は追加確認中。",
  sourceCheckedAt: "2026-09-02",
  evidenceScopes: ["phrase", "reading", "meaning", "region", "example", "usage"],
  confidence: "high",
  audioPriority: 1,
  updatedAt: "2026-09-02",
};

const imported = input.map((item, index) => {
  const region = primaryRegion[item.regionName] || item.regionName;
  const urls = splitUrls(item.sourceUrl);
  const hasExample = Boolean(item.exampleDialect?.trim() && item.exampleStandard?.trim());
  const evidenceScopes = [...new Set((item.evidenceScopes || [])
    .filter((scope) => supportedScopes.has(scope))
    .filter((scope) => scope !== "example" || hasExample))];
  const regionNote = region === item.regionName
    ? ""
    : ` 候補データでは「${item.regionName}」とされていたため、主地域を「${region}」として整理し、他地域での分布は継続確認する。`;
  const sourceNote = [item.sourceNote, item.additionalReview, regionNote]
    .filter(Boolean)
    .join(" ")
    .trim();
  const additionalSources = urls.slice(1).map((url, sourceIndex) => ({
    title: `${item.sourceTitle} 補助資料${sourceIndex + 1}`,
    organization: item.sourceOrganization,
    url,
    checkedAt: item.sourceCheckedAt,
    evidenceScopes: evidenceScopes.filter((scope) => scope !== "example"),
  }));
  return {
    id: `jp-42-nagasaki-${String(index + 2).padStart(3, "0")}`,
    slug: item.slug,
    phrase: item.phrase.trim(),
    reading: item.reading.trim(),
    standardJapanese: item.standardJapanese.trim(),
    description: descriptionFor(item, region),
    exampleDialect: hasExample ? item.exampleDialect.trim() : "",
    exampleStandard: hasExample ? item.exampleStandard.trim() : "",
    prefectureCode: 42,
    prefectureName: "長崎県",
    regionName: region,
    municipality: item.municipality || null,
    ageGroups: ["unknown"],
    usageContexts: contextFor(item),
    emotionTags: [],
    usageFrequency: "unknown",
    verificationStatus: item.phrase === "〜ち" ? "needs_review" : "reference_confirmed",
    sourceType: item.sourceType === "official_reference" ? "official_reference" : "community_or_demo",
    sourceNote,
    sourceTitle: item.sourceTitle,
    sourceOrganization: item.sourceOrganization,
    sourceUrl: urls[0],
    sourceCheckedAt: item.sourceCheckedAt,
    evidenceScopes,
    ...(additionalSources.length ? { additionalSources } : {}),
    confidence: hasExample ? "medium" : "low",
    recordingYear: null,
    audioUrl: null,
    videoUrl: null,
    needsAudio: true,
    audioPriority: hasExample ? 2 : 3,
    languageVariety: "japanese_dialect",
    createdAt: "2026-09-02",
    updatedAt: "2026-09-02",
  };
});

const output = [batten, ...imported];
await writeFile(
  new URL("src/data/dialects/nagasaki.json", root),
  `${JSON.stringify(output, null, 2)}\n`,
  "utf8",
);

const counts = Object.groupBy(output, (item) => item.regionName);
console.log(`Nagasaki records: ${output.length}`);
for (const [region, records] of Object.entries(counts)) console.log(`${region}: ${records.length}`);
console.log(`with source-backed examples: ${output.filter((item) => item.evidenceScopes?.includes("example") && item.exampleDialect).length}`);
console.log(`without examples: ${output.filter((item) => !item.exampleDialect).length}`);
