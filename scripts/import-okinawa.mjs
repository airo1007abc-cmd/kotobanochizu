import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const input = JSON.parse(await readFile(new URL("research/okinawa/public-candidates.raw.json", root), "utf8"));
const existing = JSON.parse(await readFile(new URL("src/data/dialects/okinawa.json", root), "utf8"));
const supportedScopes = new Set(["phrase", "reading", "meaning", "region", "example", "usage", "history"]);
const frequencies = new Set(["common", "occasional", "rare", "historical", "unknown"]);
const placeholder = (value = "") => /例文未確認|確認待ち|未掲載|収集中/.test(value);

const preserved = existing.filter((item) => Number(item.id.slice(-3)) <= 57).map((item) => {
  const regionName = item.regionName === "宮古" ? "宮古諸島"
    : item.regionName === "八重山" ? "八重山諸島"
      : item.regionName === "沖縄本島北部" ? "沖縄本島北部・国頭地域"
        : item.regionName;
  return regionName === item.regionName ? item : { ...item, regionName, updatedAt: "2026-09-03" };
});

const imported = input.records.map((item, index) => {
  const exampleDialect = placeholder(item.exampleDialect) ? "" : item.exampleDialect?.trim() || "";
  const exampleStandard = placeholder(item.exampleStandard) ? "" : item.exampleStandard?.trim() || "";
  const hasExample = Boolean(exampleDialect && exampleStandard);
  const place = [item.municipality, item.locality].filter(Boolean).join("・") || `沖縄県${item.regionName}`;
  const coverage = hasExample
    ? "語形・読み・意味・地点と掲載用例を資料で確認しています。現在の使用頻度、世代差、発音の地域差は追加調査中です。"
    : "語形・意味・地点を資料で確認しています。自然な会話用例、現在の使用頻度、世代差は追加調査中です。";
  const scopes = [...new Set((item.evidenceScopes || [])
    .filter((scope) => supportedScopes.has(scope))
    .filter((scope) => scope !== "example" || hasExample))];
  return {
    id: `jp-47-okinawa-${String(index + 58).padStart(3, "0")}`,
    slug: item.slug,
    phrase: item.phrase.trim(),
    reading: item.reading?.trim() || "",
    standardJapanese: item.standardJapanese.trim(),
    description: item.description?.trim()
      || `「${item.phrase}」は「${item.standardJapanese}」を表す語として、${place}を対象とする資料「${item.sourceTitle}」に掲載されています。${coverage}`,
    exampleDialect,
    exampleStandard,
    prefectureCode: 47,
    prefectureName: "沖縄県",
    regionName: item.regionName,
    municipality: item.municipality || null,
    ageGroups: ["unknown"],
    usageContexts: item.usageContexts?.length ? item.usageContexts : ["地域言語・地域文化"],
    emotionTags: [],
    usageFrequency: frequencies.has(item.usageFrequency) ? item.usageFrequency : "unknown",
    verificationStatus: "reference_confirmed",
    sourceType: item.sourceType === "official_reference" ? "official_reference"
      : item.sourceType === "academic_reference" ? "academic_reference"
        : "community_or_demo",
    sourceNote: [
      item.sourceNote,
      item.sourcePage ? `掲載箇所: ${item.sourcePage}。` : "",
      item.nuance,
      item.usageCaution,
      item.additionalReview,
      `候補資料の言語区分: ${item.languageVariety || "unknown"}。`,
    ].filter(Boolean).join(" ").trim(),
    sourceTitle: item.sourceTitle,
    sourceOrganization: item.sourceOrganization,
    sourceUrl: item.sourceUrl,
    sourceCheckedAt: item.sourceCheckedAt || "2026-09-03",
    evidenceScopes: scopes,
    confidence: hasExample ? "medium" : "low",
    recordingYear: null,
    audioUrl: null,
    videoUrl: null,
    needsAudio: true,
    audioPriority: hasExample ? 2 : 3,
    languageVariety: item.languageVariety === "ryukyuan_language"
      ? "ryukyuan_language"
      : item.languageVariety === "japanese_dialect" ? "japanese_dialect" : "unknown",
    createdAt: "2026-09-03",
    updatedAt: "2026-09-03",
  };
});

const output = [...preserved, ...imported];
await writeFile(new URL("src/data/dialects/okinawa.json", root), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`沖縄県: ${output.length}`);
for (const [region, records] of Object.entries(Object.groupBy(output, (item) => item.regionName)))
  console.log(`  ${region}: ${records.length}`);
console.log(`  source-backed examples: ${output.filter((item) => item.evidenceScopes?.includes("example") && item.exampleDialect).length}`);
