import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const scopes = new Set(["phrase", "reading", "meaning", "region", "example", "usage", "history"]);
const frequencies = new Set(["common", "occasional", "rare", "historical", "unknown"]);
const placeholder = (value = "") => /例文未確認|確認待ち|未掲載|収集中/.test(value);
const asItems = (value) => Array.isArray(value) ? value : value.records || value.entries || [];
const sourceTypeFor = (value = "") => {
  if (/official|municipal|prefectural/.test(value)) return "official_reference";
  if (/academic|university|research|national_research/.test(value)) return "academic_reference";
  return "community_or_demo";
};

const configs = [
  {
    key: "kagawa", code: 37, name: "香川県", baseCount: 1, replace: "じょんならん",
    normalize: (r) => r.startsWith("高松市周辺") ? "高松市周辺"
      : r.startsWith("中讃") ? "中讃地域"
        : r.startsWith("西讃") ? "西讃地域"
          : r.startsWith("東讃・中讃") || r.startsWith("東讃地域") ? "東讃地域"
            : "県内地域未特定",
    migrate: (r) => r === "讃岐東部" ? "東讃地域" : r === "讃岐中部" ? "中讃地域" : r === "讃岐西部" ? "西讃地域" : r,
  },
  {
    key: "yamaguchi", code: 35, name: "山口県", baseCount: 32,
    normalize: (r) => r.startsWith("県東部") ? "県東部（岩国・柳井など）"
      : r.startsWith("県中央部") ? "県中央部（山口・防府など）"
        : r.startsWith("県西部") ? "県西部（宇部・下関など）"
          : r.startsWith("県北部") ? "県北部（萩・長門など）"
            : r.startsWith("島嶼部") ? "島嶼部（周防大島・平郡島など）" : r,
    migrate: (r) => r === "東部" ? "県東部（岩国・柳井など）" : r === "中部" ? "県中央部（山口・防府など）" : r === "西部" ? "県西部（宇部・下関など）" : r === "北部" ? "県北部（萩・長門など）" : r,
  },
];

function convert(item, config, id, slug = item.slug) {
  const regionName = config.normalize(item.regionName);
  const exampleDialect = placeholder(item.exampleDialect) ? "" : item.exampleDialect?.trim() || "";
  const exampleStandard = placeholder(item.exampleStandard) ? "" : item.exampleStandard?.trim() || "";
  const hasExample = Boolean(exampleDialect && exampleStandard);
  const place = [item.municipality, item.locality].filter(Boolean).join("・") || `${config.name}${regionName}`;
  const baseDescription = item.description?.trim() || `「${item.phrase}」は「${item.standardJapanese}」を表す地域語として資料に掲載されています。`;
  const description = `${baseDescription} 本項では、${place}の「${item.phrase}」を「${item.standardJapanese}」とする「${item.sourceTitle}」の記録範囲に限定して紹介します。`;
  const evidenceScopes = [...new Set((item.evidenceScopes || []).filter((scope) => scopes.has(scope)).filter((scope) => scope !== "example" || hasExample))];
  const originalRegion = regionName !== item.regionName ? `原資料の地域表記: ${item.regionName}。サイト上は「${regionName}」に整理。` : "";
  return {
    id, slug,
    phrase: item.phrase.trim(), reading: item.reading?.trim() || "", standardJapanese: item.standardJapanese.trim(), description,
    exampleDialect, exampleStandard,
    prefectureCode: config.code, prefectureName: config.name, regionName, municipality: item.municipality || null,
    ageGroups: ["unknown"], usageContexts: item.usageContexts?.length ? item.usageContexts : ["日常会話・地域文化"], emotionTags: [],
    usageFrequency: frequencies.has(item.usageFrequency) ? item.usageFrequency : "unknown",
    verificationStatus: "reference_confirmed", sourceType: sourceTypeFor(item.sourceType),
    sourceNote: [item.sourceNote, item.sourcePage ? `掲載箇所: ${item.sourcePage}。` : "", item.nuance, item.usageCaution, item.additionalReview, originalRegion, `候補資料の言語区分: ${item.languageVariety || "unknown"}。`].filter(Boolean).join(" ").trim(),
    sourceTitle: item.sourceTitle, sourceOrganization: item.sourceOrganization, sourceUrl: item.sourceUrl,
    sourceCheckedAt: item.sourceCheckedAt || "2026-09-03", evidenceScopes,
    confidence: hasExample ? "medium" : "low", recordingYear: null, audioUrl: null, videoUrl: null, needsAudio: true, audioPriority: hasExample ? 2 : 3,
    languageVariety: item.languageVariety === "japanese_dialect" ? "japanese_dialect" : "unknown",
    createdAt: "2026-09-03", updatedAt: "2026-09-03",
  };
}

for (const config of configs) {
  const raw = JSON.parse(await readFile(new URL(`research/${config.key}/public-candidates.raw.json`, root), "utf8"));
  const candidates = asItems(raw);
  const current = JSON.parse(await readFile(new URL(`src/data/dialects/${config.key}.json`, root), "utf8"));
  let base = current.filter((item) => Number(item.id.slice(-3)) <= config.baseCount).map((item) => ({ ...item, regionName: config.migrate(item.regionName) }));
  const replacement = config.replace ? candidates.find((item) => item.phrase === config.replace) : null;
  if (replacement) base = base.map((item) => item.phrase === config.replace ? {
    ...convert(replacement, config, item.id, item.slug),
    additionalSources: [{ type: item.sourceType, title: item.sourceTitle, organization: item.sourceOrganization, url: item.sourceUrl, checkedAt: item.sourceCheckedAt, evidenceScopes: item.evidenceScopes }],
  } : item);
  let next = config.baseCount + 1;
  const imported = candidates.filter((item) => item !== replacement).map((item) => {
    const result = convert(item, config, `jp-${config.code}-${config.key}-${String(next).padStart(3, "0")}`);
    next += 1;
    return result;
  });
  const output = [...base, ...imported];
  await writeFile(new URL(`src/data/dialects/${config.key}.json`, root), `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`${config.name}: ${output.length}`);
  for (const [region, records] of Object.entries(Object.groupBy(output, (item) => item.regionName))) console.log(`  ${region}: ${records.length}`);
}
