import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const miyInput = JSON.parse(await readFile(new URL("research/miyazaki/research.raw.json", root), "utf8"));
const kagInput = JSON.parse(await readFile(new URL("research/kagoshima/partial-before-amami.raw.json", root), "utf8"));
const miyExisting = JSON.parse(await readFile(new URL("src/data/dialects/miyazaki.json", root), "utf8"));
const kagExisting = JSON.parse(await readFile(new URL("src/data/dialects/kagoshima.json", root), "utf8"));

const supportedScopes = new Set(["phrase", "reading", "meaning", "region", "example", "usage", "history"]);
const frequencies = new Set(["common", "occasional", "rare", "historical", "unknown"]);
const placeholder = (value = "") => /例文未確認|確認待ち|未掲載|収集中/.test(value);
const sourceTypeFor = (value) => {
  if (value === "official_reference") return value;
  if (value === "academic_reference") return value;
  return "community_or_demo";
};
const cleanExample = (value) => placeholder(value) ? "" : value?.trim() || "";
const scopesFor = (item, hasExample) => [...new Set((item.evidenceScopes || [])
  .filter((scope) => supportedScopes.has(scope))
  .filter((scope) => scope !== "example" || hasExample))];
const rawNotes = (item, extras = []) => [
  item.sourceNote,
  item.sourcePage ? `掲載箇所: ${item.sourcePage}。` : "",
  item.nuance,
  item.usageCaution,
  item.additionalReview,
  ...extras,
].filter(Boolean).join(" ").trim();

const miyPrimaryRegion = new Map([
  ["いお／いよ", "県南"],
  ["さるく", "県南"],
  ["よだきぃ", "県南"],
  ["のさん", "県北"],
]);
const kagPrimaryRegion = new Map([
  ["おじゃったもんせ", "大隅"],
  ["シッタレ", "大隅"],
]);

function importedRecord(item, { id, prefectureCode, prefectureName, regionName, languageVariety = "japanese_dialect" }) {
  const exampleDialect = cleanExample(item.exampleDialect);
  const exampleStandard = cleanExample(item.exampleStandard);
  const hasExample = Boolean(exampleDialect && exampleStandard);
  const place = item.locality || item.municipality || `${prefectureName}${regionName}`;
  const coverage = hasExample
    ? "語形・意味・地域と掲載用例を資料で確認しています。現在の使用頻度、世代差、発音は追加調査中です。"
    : "語形・意味・地域を資料で確認しています。自然な会話用例、現在の使用頻度、世代差、発音は追加調査中です。";
  const description = item.description?.trim()
    || `「${item.phrase}」は「${item.standardJapanese}」を表す語として、${place}を対象とする資料「${item.sourceTitle}」に掲載されています。${coverage}`;
  const originalRegion = item.regionName !== regionName ? `原資料の地域表記: ${item.regionName}。主地域を「${regionName}」として整理。` : "";
  const varietyNote = item.languageVariety && item.languageVariety !== "japanese_dialect"
    ? `原資料の言語区分: ${item.languageVariety}。`
    : "";
  return {
    id,
    slug: item.slug,
    phrase: item.phrase.trim(),
    reading: item.reading?.trim() || "",
    standardJapanese: item.standardJapanese.trim(),
    description,
    exampleDialect,
    exampleStandard,
    prefectureCode,
    prefectureName,
    regionName,
    municipality: item.municipality || null,
    ageGroups: ["unknown"],
    usageContexts: item.usageContexts?.length ? item.usageContexts : ["日常会話・地域文化"],
    emotionTags: [],
    usageFrequency: frequencies.has(item.usageFrequency) ? item.usageFrequency : "unknown",
    verificationStatus: "reference_confirmed",
    sourceType: sourceTypeFor(item.sourceType),
    sourceNote: rawNotes(item, [originalRegion, varietyNote]),
    sourceTitle: item.sourceTitle,
    sourceOrganization: item.sourceOrganization,
    sourceUrl: item.sourceUrl,
    sourceCheckedAt: item.sourceCheckedAt || "2026-09-02",
    evidenceScopes: scopesFor(item, hasExample),
    confidence: hasExample ? "medium" : "low",
    recordingYear: null,
    audioUrl: null,
    videoUrl: null,
    needsAudio: true,
    audioPriority: hasExample ? 2 : 3,
    languageVariety,
    createdAt: "2026-09-02",
    updatedAt: "2026-09-02",
  };
}

const miyTegeResearch = miyInput.entries.find((item) => item.phrase === "てげ");
const miyTegeOld = miyExisting.find((item) => item.phrase === "てげ");
const miyTege = {
  ...importedRecord(miyTegeResearch, {
    id: miyTegeOld.id,
    prefectureCode: 45,
    prefectureName: "宮崎県",
    regionName: "県央",
  }),
  slug: miyTegeOld.slug,
  reading: miyTegeOld.reading,
  additionalSources: [{
    type: miyTegeOld.sourceType,
    title: miyTegeOld.sourceTitle,
    organization: miyTegeOld.sourceOrganization,
    url: miyTegeOld.sourceUrl,
    checkedAt: miyTegeOld.sourceCheckedAt,
    evidenceScopes: miyTegeOld.evidenceScopes,
  }],
};
const miyPreserved = miyExisting.filter((item) => item.phrase !== "てげ");
const miyImported = miyInput.entries.filter((item) => item.phrase !== "てげ").map((item, index) => importedRecord(item, {
  id: `jp-45-miyazaki-${String(index + 14).padStart(3, "0")}`,
  prefectureCode: 45,
  prefectureName: "宮崎県",
  regionName: miyPrimaryRegion.get(item.phrase) || item.regionName,
}));
const miyOutput = [miyTege, ...miyPreserved, ...miyImported];

const kagPreserved = kagExisting.map((item) => item.regionName === "屋久島"
  ? { ...item, regionName: "種子島・屋久島", updatedAt: "2026-09-02" }
  : item);
const kagImported = kagInput.records.map((item, index) => importedRecord(item, {
  id: `jp-46-kagoshima-${String(index + 20).padStart(3, "0")}`,
  prefectureCode: 46,
  prefectureName: "鹿児島県",
  regionName: kagPrimaryRegion.get(item.phrase) || item.regionName,
  languageVariety: "japanese_dialect",
}));
const kagOutput = [...kagPreserved, ...kagImported];

await writeFile(new URL("src/data/dialects/miyazaki.json", root), `${JSON.stringify(miyOutput, null, 2)}\n`, "utf8");
await writeFile(new URL("src/data/dialects/kagoshima.json", root), `${JSON.stringify(kagOutput, null, 2)}\n`, "utf8");

for (const [name, output] of [["宮崎県", miyOutput], ["鹿児島県", kagOutput]]) {
  console.log(`${name}: ${output.length}`);
  for (const [region, records] of Object.entries(Object.groupBy(output, (item) => item.regionName)))
    console.log(`  ${region}: ${records.length}`);
  console.log(`  source-backed examples: ${output.filter((item) => item.evidenceScopes?.includes("example") && item.exampleDialect).length}`);
}
