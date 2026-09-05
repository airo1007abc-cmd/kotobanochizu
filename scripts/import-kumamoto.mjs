import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const input = JSON.parse(await readFile(new URL("research/kumamoto/public-candidates.raw.json", root), "utf8"));
const existing = JSON.parse(await readFile(new URL("src/data/dialects/kumamoto.json", root), "utf8"));

const sourceUrls = {
  S01: "https://www.city.kumamoto.jp/chuo/kiji00323740/5_23740_166195_up_VOQTRDC5.pdf",
  S02: "https://www.city.kumamoto.jp/sicho/kiji00351353/index.html",
  S03: "https://www.city.tamana.lg.jp/q/aview/177/18289.html",
  S04: "https://www.fukujo.ac.jp/university/kumamoto_project/a62",
  S04B: "https://minamiasoijyuu.jp/minamiaso-word/",
  S05: "https://www.city.yatsushiro.lg.jp/kiji00323584/index.html",
  S06: "https://www.city.yatsushiro.lg.jp/kiji0031915/3_1915_2059_up_s83vsuhq.pdf",
  S07: "https://www.city.yatsushiro.lg.jp/kiji003762/3_762_6_imwfvoazniba2uactjimwce1.pdf",
  S07B: "https://www.city.yatsushiro.lg.jp/kiji00317271/3_17271_81462_up_c265tto4.pdf",
  S08: "https://www.city.yatsushiro.lg.jp/kiji00321294/3_21294_115112_up_qrge0ua0.pdf",
  S09: "https://mmsrv.ninjal.ac.jp/hogendanwa_db/list06/index.html",
  S10: "https://hougen.amakusa-web.jp/MyHp/Pub/Free.aspx?CNo=3",
  S11: "https://ndlsearch.ndl.go.jp/books/R100000002-I027543283",
  S12: "https://www.pref.kumamoto.jp/soshiki/58/258611.html",
  S13: "https://www.city.amakusa.kumamoto.jp/kiji0036844/3_6844_29016_up_ihym6hkp.pdf",
};
const supportedScopes = new Set(["phrase", "reading", "meaning", "region", "example", "usage", "history"]);
const placeholder = (value = "") => /例文未確認|確認待ち|未掲載/.test(value);
const regionOverrides = new Map([
  ["あとぜき", "阿蘇"],
  ["からう", "熊本周辺"],
  ["さしより", "熊本周辺"],
  ["あくしゃうつ", "熊本周辺"],
  ["かたる", "県南"],
]);
const regionFor = (item) => regionOverrides.get(item.phrase) || item.regionName;
const sourceTypeFor = (value) => value === "official_reference"
  ? value
  : value === "academic_reference"
    ? value
    : "community_or_demo";

const imported = input.map((item, index) => {
  const region = regionFor(item);
  const exampleDialect = placeholder(item.exampleDialect) ? "" : item.exampleDialect?.trim() || "";
  const exampleStandard = placeholder(item.exampleStandard) ? "" : item.exampleStandard?.trim() || "";
  const hasExample = Boolean(exampleDialect && exampleStandard);
  const scopes = [...new Set((item.evidenceScopes || [])
    .filter((scope) => supportedScopes.has(scope))
    .filter((scope) => scope !== "example" || hasExample))];
  const place = item.locality || item.municipality || `熊本県${region}`;
  const coverage = hasExample
    ? "語形・意味・地域に加えて掲載用例も確認済みです。現在の使用頻度、世代差、発音は追加調査中です。"
    : "語形・意味・地域を資料で確認しています。自然な会話用例、現在の使用頻度、世代差、発音は追加調査中です。";
  const regionNote = region === item.regionName
    ? ""
    : ` 候補資料では「${item.regionName}」でも確認されているため、主地域を「${region}」として整理し、他地域の分布は注記として保持する。`;
  return {
    id: `jp-43-kumamoto-${String(index + 2).padStart(3, "0")}`,
    slug: item.slug,
    phrase: item.phrase.trim(),
    reading: item.reading?.trim() || "",
    standardJapanese: item.standardJapanese.trim(),
    description: `${item.description.trim()} 「${item.phrase}」は、${place}を対象とする資料「${item.sourceTitle}」に掲載されています。${coverage}`,
    exampleDialect,
    exampleStandard,
    prefectureCode: 43,
    prefectureName: "熊本県",
    regionName: region,
    municipality: item.municipality || null,
    ageGroups: ["unknown"],
    usageContexts: item.usageContexts?.length ? item.usageContexts : ["日常会話・地域文化"],
    emotionTags: [],
    usageFrequency: item.usageFrequency || "unknown",
    verificationStatus: "reference_confirmed",
    sourceType: sourceTypeFor(item.sourceType),
    sourceNote: [
      item.sourceNote,
      item.sourcePage ? `掲載箇所: ${item.sourcePage}。` : "",
      item.usageCaution,
      item.additionalReview,
      regionNote,
    ].filter(Boolean).join(" ").trim(),
    sourceTitle: item.sourceTitle,
    sourceOrganization: item.sourceOrganization,
    sourceUrl: sourceUrls[item.sourceUrl],
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
});

const output = [{
  ...existing[0],
  exampleDialect: "",
  exampleStandard: "",
  updatedAt: "2026-09-02",
}, ...imported];

await writeFile(new URL("src/data/dialects/kumamoto.json", root), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`熊本県: ${output.length}`);
for (const [region, records] of Object.entries(Object.groupBy(output, (item) => item.regionName)))
  console.log(`  ${region}: ${records.length}`);
console.log(`  source-backed examples: ${output.filter((item) => item.evidenceScopes?.includes("example") && item.exampleDialect).length}`);
