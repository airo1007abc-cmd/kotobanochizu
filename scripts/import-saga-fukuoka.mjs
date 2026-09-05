import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const sagaRaw = JSON.parse(await readFile(new URL("research/saga/confirmed-46.raw.json", root), "utf8"));
const fukuokaRaw = JSON.parse(await readFile(new URL("research/fukuoka/public-candidates.raw.json", root), "utf8"));
const sagaExisting = JSON.parse(await readFile(new URL("src/data/dialects/saga.json", root), "utf8"));

const supportedScopes = new Set(["phrase", "reading", "meaning", "region", "example", "usage", "history"]);
const placeholder = (value = "") => /例文未確認|確認待ち|未掲載/.test(value);
const normalizeSourceType = (value) => {
  if (value === "official_reference") return value;
  if (["academic_reference", "research_reference"].includes(value)) return "academic_reference";
  return "community_or_demo";
};
const primaryRegion = (value) => value.includes("、")
  ? (value.includes("杵島・藤津") ? "杵島・藤津" : value.split("、")[0])
  : value.replace("北九州・筑豊", "筑豊");

const translatedFukuokaExamples = new Map([
  ["さっち", "必ずこの店に行くね。"],
  ["そうつく", "どこを歩き回って来たの。"],
  ["どげん", "どうしたの。"],
  ["なおす", "これを片づけておいて。"],
  ["ねまる", "これ、腐っているよ。"],
  ["はらかく", "怒っているの。"],
  ["ふうたんぬるい", "あいつに任せていたら日が暮れるよ。のろいだろう。"],
  ["ほがす", "その板に棒を通すから、穴をあけておいて。"],
]);
const supportedAges = new Set(["unknown", "10〜30代", "40〜60代", "70代以上", "全年代"]);

const enrichDescription = (item, region, hasExample) => {
  const place = item.locality || item.municipality || `${item.prefectureName}${region}`;
  const sourceCoverage = hasExample
    ? "語形・意味・地域に加えて掲載用例も確認済みです。現在の使用頻度、世代差、発音は追加調査中です。"
    : "語形・意味・地域を資料で確認しています。自然な会話用例、現在の使用頻度、世代差、発音は追加調査中です。";
  return `${item.description.trim()} 「${item.phrase}」は、${place}を対象とする資料「${item.sourceTitle}」に掲載されています。${sourceCoverage}`;
};

const convert = (item, options) => {
  const region = primaryRegion(item.regionName);
  const translated = options.prefectureCode === 40 ? translatedFukuokaExamples.get(item.phrase) : undefined;
  const exampleDialect = placeholder(item.exampleDialect) ? "" : item.exampleDialect?.trim() || "";
  const exampleStandard = placeholder(item.exampleStandard)
    ? ""
    : item.exampleStandard?.trim() || translated || "";
  const hasExample = Boolean(exampleDialect && exampleStandard);
  const scopes = [...new Set((item.evidenceScopes || [])
    .filter((scope) => supportedScopes.has(scope))
    .filter((scope) => scope !== "example" || hasExample))];
  const otherRegions = region === item.regionName ? "" : ` 候補資料では「${item.regionName}」でも確認されているため、他地域での分布を注記として保持する。`;
  const editorialTranslation = translated && !item.exampleStandard?.trim()
    ? " 標準語例は、資料掲載用例を語義に沿って編集部で逐語的に訳したもの。"
    : "";
  return {
    id: `${options.idPrefix}${String(options.index).padStart(3, "0")}`,
    slug: item.slug,
    phrase: item.phrase.trim(),
    reading: item.reading?.trim() || "",
    standardJapanese: item.standardJapanese.trim(),
    description: enrichDescription(item, region, hasExample),
    exampleDialect,
    exampleStandard,
    prefectureCode: options.prefectureCode,
    prefectureName: options.prefectureName,
    regionName: region,
    municipality: item.municipality || null,
    ageGroups: item.ageGroups?.filter((age) => supportedAges.has(age)).length
      ? item.ageGroups.filter((age) => supportedAges.has(age))
      : ["unknown"],
    usageContexts: item.usageContexts?.length ? item.usageContexts : ["日常会話・地域文化"],
    emotionTags: [],
    usageFrequency: item.usageFrequency || "unknown",
    verificationStatus: "reference_confirmed",
    sourceType: normalizeSourceType(item.sourceType),
    sourceNote: [item.sourceNote, item.sourcePage ? `掲載箇所: ${item.sourcePage}。` : "", item.usageCaution, item.additionalReview, otherRegions, editorialTranslation]
      .filter(Boolean).join(" ").trim(),
    sourceTitle: item.sourceTitle,
    sourceOrganization: item.sourceOrganization,
    sourceUrl: item.sourceUrl,
    sourceCheckedAt: item.sourceCheckedAt,
    evidenceScopes: scopes,
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
};

const saga = [
  {
    ...sagaExisting[0],
    exampleDialect: "",
    exampleStandard: "",
    updatedAt: "2026-09-02",
  },
  ...sagaRaw.map((item, index) => convert(item, {
    prefectureCode: 41,
    prefectureName: "佐賀県",
    idPrefix: "jp-41-saga-",
    index: index + 2,
  })),
];
const fukuoka = fukuokaRaw.map((item, index) => convert(item, {
  prefectureCode: 40,
  prefectureName: "福岡県",
  idPrefix: "jp-40-fukuoka-",
  index: index + 1,
}));

await writeFile(new URL("src/data/dialects/saga.json", root), `${JSON.stringify(saga, null, 2)}\n`, "utf8");
await writeFile(new URL("src/data/dialects/fukuoka.json", root), `${JSON.stringify(fukuoka, null, 2)}\n`, "utf8");

for (const [name, records] of [["佐賀県", saga], ["福岡県", fukuoka]]) {
  console.log(`${name}: ${records.length}`);
  for (const [region, count] of Object.entries(Object.groupBy(records, (item) => item.regionName)))
    console.log(`  ${region}: ${count.length}`);
  console.log(`  source-backed examples: ${records.filter((item) => item.evidenceScopes?.includes("example") && item.exampleDialect).length}`);
}
