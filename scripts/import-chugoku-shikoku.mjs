import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const scopes = new Set(["phrase", "reading", "meaning", "region", "example", "usage", "history"]);
const frequencies = new Set(["common", "occasional", "rare", "historical", "unknown"]);
const placeholder = (value = "") => /例文未確認|確認待ち|未掲載|収集中/.test(value);
const asItems = (value) => Array.isArray(value) ? value : value.records || value.entries || value.candidates || [];

const configs = [
  {
    key: "hiroshima", code: 34, name: "広島県", baseCount: 1,
    normalize: (r) => r,
    migrate: (r) => r === "安芸" ? "広島市周辺・県西部" : r === "備後" ? "福山・尾道など県東部" : r,
  },
  {
    key: "kochi", code: 39, name: "高知県", baseCount: 20,
    normalize: (r) => r.startsWith("県東部") ? "県東部"
      : r.startsWith("高知市周辺") ? "高知市周辺・県中央部"
        : r.startsWith("県西部") ? "県西部"
          : r.startsWith("四万十・幡多") ? "四万十・幡多地域"
            : r.startsWith("嶺北") ? "嶺北など山間部" : r,
    migrate: (r) => r === "東部" ? "県東部" : r === "中央部" ? "高知市周辺・県中央部" : r === "西部" ? "県西部" : r === "幡多" ? "四万十・幡多地域" : r,
    skip: (item) => item.phrase === "まっこと" && item.locality === "朝倉米田",
  },
  {
    key: "tokushima", code: 36, name: "徳島県", baseCount: 1,
    normalize: (r) => r.startsWith("吉野川中上流") ? "吉野川中上流・県西部" : r,
    migrate: (r) => r === "東部" ? "徳島市周辺・県東部" : r === "南部" ? "阿南周辺・県南部" : r === "西部" ? "吉野川中上流・県西部" : r,
  },
  {
    key: "shimane", code: 32, name: "島根県", baseCount: 1,
    normalize: (r) => r,
    migrate: (r) => r === "出雲" ? "出雲地域" : r === "石見" ? "石見地域" : r === "隠岐" ? "隠岐諸島" : r,
    replace: "だんだん",
  },
  {
    key: "okayama", code: 33, name: "岡山県", baseCount: 1,
    normalize: (r) => r.startsWith("岡山市周辺") || r.startsWith("備前地域") ? "備前地域"
      : r.startsWith("倉敷市周辺") || r.startsWith("備中地域") ? "備中地域"
        : r.startsWith("美作地域") ? "美作地域"
          : r.startsWith("瀬戸内海島嶼部") ? "瀬戸内海島嶼部" : r,
    migrate: (r) => r === "備前" ? "備前地域" : r === "備中" ? "備中地域" : r === "美作" ? "美作地域" : r,
  },
  {
    key: "tottori", code: 31, name: "鳥取県", baseCount: 1,
    normalize: (r) => r.startsWith("因幡") || r.startsWith("鳥取県東部") || r.startsWith("鳥取地方") ? "因幡・県東部"
      : r.startsWith("東伯耆") ? "東伯耆・県中部"
        : r.startsWith("日野地域") ? "日野地域"
          : r.startsWith("米子") ? "西伯耆・県西部" : r,
    migrate: (r) => r === "東部" ? "因幡・県東部" : r === "中部" ? "東伯耆・県中部" : r === "西部" ? "西伯耆・県西部" : r,
    replace: "だんだん",
  },
  {
    key: "ehime", code: 38, name: "愛媛県", baseCount: 1,
    normalize: (r) => r,
    migrate: (r) => r,
  },
];

const sourceTypeFor = (value = "") => {
  if (/official|municipal|prefectural|national_official/.test(value)) return "official_reference";
  if (/academic|university|research|national_research/.test(value)) return "academic_reference";
  return "community_or_demo";
};

function convert(item, config, id, slug = item.slug) {
  const regionName = config.normalize(item.regionName);
  const exampleDialect = placeholder(item.exampleDialect) ? "" : item.exampleDialect?.trim() || "";
  const exampleStandard = placeholder(item.exampleStandard) ? "" : item.exampleStandard?.trim() || "";
  const hasExample = Boolean(exampleDialect && exampleStandard);
  const place = [item.municipality, item.locality].filter(Boolean).join("・") || `${config.name}${regionName}`;
  const baseDescription = item.description?.trim()
    || `「${item.phrase}」は「${item.standardJapanese}」を表す語として、${place}を対象とする資料「${item.sourceTitle}」に掲載されています。${hasExample ? "語形・意味・地域と掲載用例を確認しています。" : "語形・意味・地域を確認し、自然な会話用例は追加調査中です。"}`;
  const description = `${baseDescription} 本項では、${place}の「${item.phrase}」を「${item.standardJapanese}」とする「${item.sourceTitle}」の記録範囲に限定して紹介します。`;
  const evidenceScopes = [...new Set((item.evidenceScopes || [])
    .filter((scope) => scopes.has(scope))
    .filter((scope) => scope !== "example" || hasExample))];
  const originalRegion = regionName !== item.regionName ? `原資料の地域表記: ${item.regionName}。サイト上は「${regionName}」に整理。` : "";
  const languageVariety = item.languageVariety === "japanese_dialect" ? "japanese_dialect"
    : item.languageVariety === "ryukyuan_language" ? "ryukyuan_language" : "unknown";
  return {
    id, slug,
    phrase: item.phrase.trim(),
    reading: item.reading?.trim() || "",
    standardJapanese: item.standardJapanese.trim(),
    description,
    exampleDialect,
    exampleStandard,
    prefectureCode: config.code,
    prefectureName: config.name,
    regionName,
    municipality: item.municipality || null,
    ageGroups: ["unknown"],
    usageContexts: item.usageContexts?.length ? item.usageContexts : ["日常会話・地域文化"],
    emotionTags: [],
    usageFrequency: frequencies.has(item.usageFrequency) ? item.usageFrequency : "unknown",
    verificationStatus: "reference_confirmed",
    sourceType: sourceTypeFor(item.sourceType),
    sourceNote: [item.sourceNote, item.sourcePage ? `掲載箇所: ${item.sourcePage}。` : "", item.nuance, item.usageCaution, item.additionalReview, originalRegion, `候補資料の言語区分: ${item.languageVariety || "unknown"}。`].filter(Boolean).join(" ").trim(),
    sourceTitle: item.sourceTitle,
    sourceOrganization: item.sourceOrganization,
    sourceUrl: item.sourceUrl,
    sourceCheckedAt: item.sourceCheckedAt || "2026-09-03",
    evidenceScopes,
    confidence: hasExample ? "medium" : "low",
    recordingYear: null,
    audioUrl: null,
    videoUrl: null,
    needsAudio: true,
    audioPriority: hasExample ? 2 : 3,
    languageVariety,
    createdAt: "2026-09-03",
    updatedAt: "2026-09-03",
  };
}

for (const config of configs) {
  const raw = JSON.parse(await readFile(new URL(`research/${config.key}/public-candidates.raw.json`, root), "utf8"));
  const candidates = asItems(raw);
  const current = JSON.parse(await readFile(new URL(`src/data/dialects/${config.key}.json`, root), "utf8"));
  let base = current.filter((item) => Number(item.id.slice(-3)) <= config.baseCount)
    .map((item) => ({ ...item, regionName: config.migrate(item.regionName) }));
  const replacement = config.replace ? candidates.find((item) => item.phrase === config.replace) : null;
  if (replacement) {
    base = base.map((item) => item.phrase === config.replace
      ? { ...convert(replacement, config, item.id, item.slug), additionalSources: [{ type: item.sourceType, title: item.sourceTitle, organization: item.sourceOrganization, url: item.sourceUrl, checkedAt: item.sourceCheckedAt, evidenceScopes: item.evidenceScopes }] }
      : item);
  }
  let next = config.baseCount + 1;
  const imported = candidates.filter((item) => item !== replacement && !config.skip?.(item)).map((item) => {
    const record = convert(item, config, `jp-${config.code}-${config.key}-${String(next).padStart(3, "0")}`);
    next += 1;
    return record;
  });
  const output = [...base, ...imported];
  await writeFile(new URL(`src/data/dialects/${config.key}.json`, root), `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`${config.name}: ${output.length}`);
  for (const [region, records] of Object.entries(Object.groupBy(output, (item) => item.regionName))) console.log(`  ${region}: ${records.length}`);
}
