import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const input = JSON.parse(await readFile(new URL("research/oita/verified-all-regions.raw.json", root), "utf8"));
const existing = JSON.parse(await readFile(new URL("src/data/dialects/oita.json", root), "utf8"));
const supportedScopes = new Set(["phrase", "reading", "meaning", "region", "example", "usage", "history"]);
const primaryRegion = new Map([
  ["ムゲネー", "南部"],
  ["ごたんなぁ", "中部"],
  ["～よる", "西部"],
  ["～ちょん", "南部"],
  ["～キル／～キラン", "西部"],
  ["～ルル／～レン", "南部"],
]);
const placeholder = (value = "") => /例文未確認|確認待ち|未掲載/.test(value);
const supportedFrequencies = new Set(["common", "occasional", "rare", "historical", "unknown"]);
const sourceTypeFor = (value) => {
  if (value === "official_reference") return value;
  if (["academic_reference", "university_project"].includes(value)) return "academic_reference";
  return "community_or_demo";
};
const scopesFor = (item, hasExample) => [...new Set((item.evidenceScopes || [])
  .filter((scope) => supportedScopes.has(scope))
  .filter((scope) => scope !== "example" || hasExample))];

const yodakiiResearch = input.find((item) => item.phrase === "よだきい");
const yodakii = {
  ...existing[0],
  additionalSources: [{
    type: "community_or_demo",
    title: yodakiiResearch.sourceTitle,
    organization: yodakiiResearch.sourceOrganization,
    url: yodakiiResearch.sourceUrl,
    checkedAt: yodakiiResearch.sourceCheckedAt,
    evidenceScopes: scopesFor(yodakiiResearch, false),
  }],
  sourceNote: `${existing[0].sourceNote} 補助資料「${yodakiiResearch.sourceTitle}」で語形・意味・語源に関する調査回答を確認。語源説明は補助資料の記述範囲として扱う。`,
  updatedAt: "2026-09-02",
};

const candidates = input.filter((item) => item.phrase !== "よだきい");
const imported = candidates.map((item, index) => {
  const region = primaryRegion.get(item.phrase) || item.regionName;
  const exampleDialect = placeholder(item.exampleDialect) ? "" : item.exampleDialect?.trim() || "";
  const exampleStandard = placeholder(item.exampleStandard) ? "" : item.exampleStandard?.trim() || "";
  const hasExample = Boolean(exampleDialect && exampleStandard);
  const place = item.locality || item.municipality || `大分県${region}`;
  const coverage = hasExample
    ? "語形・意味・地域に加えて掲載用例も確認済みです。現在の使用頻度、世代差、発音は追加調査中です。"
    : "語形・意味・地域を資料で確認しています。自然な会話用例、現在の使用頻度、世代差、発音は追加調査中です。";
  const regionNote = region === item.regionName
    ? ""
    : ` 候補資料では「${item.regionName}」でも確認されているため、主地域を「${region}」として整理し、他地域の分布は注記として保持する。`;
  const ageNote = item.ageGroups?.length ? ` 原資料の世代表記: ${item.ageGroups.join("、")}。` : "";
  return {
    id: `jp-44-oita-${String(index + 2).padStart(3, "0")}`,
    slug: item.slug,
    phrase: item.phrase.trim(),
    reading: item.reading?.trim() || "",
    standardJapanese: item.standardJapanese.trim(),
    description: `${item.description.trim()} 「${item.phrase}」は、${place}を対象とする資料「${item.sourceTitle}」に掲載されています。${coverage}`,
    exampleDialect,
    exampleStandard,
    prefectureCode: 44,
    prefectureName: "大分県",
    regionName: region,
    municipality: item.municipality || null,
    ageGroups: ["unknown"],
    usageContexts: item.usageContexts?.length ? item.usageContexts : ["日常会話・地域文化"],
    emotionTags: [],
    usageFrequency: supportedFrequencies.has(item.usageFrequency) ? item.usageFrequency : "unknown",
    verificationStatus: "reference_confirmed",
    sourceType: sourceTypeFor(item.sourceType),
    sourceNote: [
      item.sourceNote,
      item.sourcePage ? `掲載箇所: ${item.sourcePage}。` : "",
      item.usageCaution,
      item.additionalReview,
      regionNote,
      ageNote,
      !supportedFrequencies.has(item.usageFrequency) && item.usageFrequency
        ? ` 原資料の頻度表記: ${item.usageFrequency}。`
        : "",
    ].filter(Boolean).join(" ").trim(),
    sourceTitle: item.sourceTitle,
    sourceOrganization: item.sourceOrganization,
    sourceUrl: item.sourceUrl,
    sourceCheckedAt: item.sourceCheckedAt,
    evidenceScopes: scopesFor(item, hasExample),
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

const output = [yodakii, ...imported];
await writeFile(new URL("src/data/dialects/oita.json", root), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`大分県: ${output.length}`);
for (const [region, records] of Object.entries(Object.groupBy(output, (item) => item.regionName)))
  console.log(`  ${region}: ${records.length}`);
console.log(`  source-backed examples: ${output.filter((item) => item.evidenceScopes?.includes("example") && item.exampleDialect).length}`);
