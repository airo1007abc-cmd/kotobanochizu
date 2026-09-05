import fs from "node:fs";

const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const catalog = read("src/data/regions.json");
const priority = read("reports/dialect-content-priority.json").records;
const rawFiles = fs.readdirSync("src/data/dialects").filter((file) => file.endsWith(".json"));
const raw = rawFiles.flatMap((file) => read(`src/data/dialects/${file}`));
const rawById = new Map(raw.map((item) => [item.id, item]));
const legacyIds = { "福岡県|福岡市周辺": "r1", "福岡県|北九州": "r2", "福岡県|筑後": "r3", "大阪府|大阪市": "r4", "大阪府|河内": "r5", "大阪府|泉州": "r6", "青森県|津軽": "r7", "青森県|南部": "r8", "青森県|下北": "r9" };
const prefectureNames = Object.keys(catalog);
const regions = prefectureNames.flatMap((prefectureName, index) => catalog[prefectureName].map((regionName) => {
  const prefectureCode = index + 1;
  const id = legacyIds[`${prefectureName}|${regionName}`] ?? `jp-${String(prefectureCode).padStart(2, "0")}-region-${regionName}`;
  const records = priority.filter((item) => item.prefecture === prefectureName && item.region === regionName);
  const varieties = [...new Set(records.map((record) => rawById.get(record.id)?.languageVariety ?? "japanese_dialect"))].sort();
  const municipalities = [...new Set(records.map((item) => item.municipality).filter(Boolean))].sort();
  const sourceCount = records.filter((item) => item.sourceCount > 0).length;
  const verifiedCount = records.filter((item) => ["verified", "reference_confirmed", "community_confirmed", "reviewed"].includes(item.verificationStatus)).length;
  return {
    regionId: id, regionName, prefectureId: `p${prefectureCode}`, prefectureName,
    dialectCount: records.length,
    indexableCount: records.filter((item) => item.indexStatus === "indexable").length,
    noindexCount: records.filter((item) => item.indexStatus === "noindex").length,
    sourceCount, sourceCoverage: records.length ? Number((sourceCount / records.length).toFixed(4)) : 0,
    verifiedCount, verificationCoverage: records.length ? Number((verifiedCount / records.length).toFixed(4)) : 0,
    languageVarieties: varieties, languageVarietyCount: varieties.length,
    municipalities, municipalityCount: municipalities.length,
    longestWord: [...records].sort((a, b) => b.word.length - a.word.length)[0]?.word ?? "",
    nameLength: regionName.length,
    islandLike: /島|壱岐|対馬|奄美|甑|宮古|八重山|与那国|佐渡|淡路/.test(regionName),
  };
}));
const counts = regions.map((item) => item.dialectCount).sort((a, b) => a - b);
const median = counts.length ? (counts[Math.floor((counts.length - 1) / 2)] + counts[Math.floor(counts.length / 2)]) / 2 : 0;
const output = {
  generatedAt: "2026-09-05", routePattern: "/regions/:id", totalRegions: regions.length,
  uniqueRegionIds: new Set(regions.map((item) => item.regionId)).size,
  prefecturesWithRegions: new Set(regions.map((item) => item.prefectureId)).size,
  zeroWordRegions: regions.filter((item) => item.dialectCount === 0).length,
  oneOrTwoWordRegions: regions.filter((item) => item.dialectCount > 0 && item.dialectCount <= 2).length,
  maxDialectRegion: [...regions].sort((a, b) => b.dialectCount - a.dialectCount)[0],
  medianDialectCount: median,
  longestRegionName: [...regions].sort((a, b) => b.nameLength - a.nameLength)[0],
  regionsWithLanguageVariety: regions.filter((item) => item.languageVarieties.some((value) => value !== "japanese_dialect")).length,
  multiLanguageVarietyRegions: regions.filter((item) => item.languageVarietyCount > 1),
  islandRegions: regions.filter((item) => item.islandLike),
  indexableRegionPages: 0,
  noindexRegionPages: regions.length,
  seoNote: "既存static-pages.mjsでは通常Region Routeをnoindex,followとして生成",
  regions,
};
write("reports/region-v2-baseline.json", output);

const nonEmpty = regions.filter((item) => item.dialectCount > 0);
const max = [...regions].sort((a, b) => b.dialectCount - a.dialectCount)[0];
const min = [...nonEmpty].sort((a, b) => a.dialectCount - b.dialectCount)[0];
const longest = output.longestRegionName;
const island = [...output.islandRegions].sort((a, b) => b.dialectCount - a.dialectCount)[0];
const by = (prefecture, region) => regions.find((item) => item.prefectureName === prefecture && item.regionName === region);
const low = [...nonEmpty].sort((a, b) => a.sourceCoverage - b.sourceCoverage || b.dialectCount - a.dialectCount)[0];
const archetypes = [
  ["A_MAX_DIALECTS", max, `方言数最多 ${max.dialectCount}語`],
  ["B_LOW_DIALECTS", min, `最少の非空地域 ${min.dialectCount}語`],
  ["C_ONE_OR_TWO", min, "1〜2語の薄い地域"],
  ["D_LONG_NAME", longest, `地域名最長 ${longest.nameLength}文字`],
  ["E_ISLAND", island, "島・離島地域"],
  ["F_OKINAWA", by("沖縄県", "宮古諸島"), "沖縄のlanguageVariety保持"],
  ["G_KAGOSHIMA_AMAMI", by("鹿児島県", "奄美"), "鹿児島・奄美の分類保持"],
  ["H_MULTI_MUNICIPALITY", [...regions].sort((a, b) => b.municipalityCount - a.municipalityCount)[0], "地点・市町村が多い地域"],
  ["I_SAGA", by("佐賀県", "佐賀平野"), "佐賀県baseline"],
  ["J_LOW_SOURCE", low, `出典率 ${Math.round(low.sourceCoverage * 100)}%`],
].filter(([, item]) => item).map(([type, item, reason]) => ({ type, regionId: item.regionId, regionName: item.regionName, prefectureName: item.prefectureName, reason, metrics: item }));
write("reports/region-v2-archetypes.json", { generatedAt: "2026-09-05", selectedCount: archetypes.length, uniqueRegionCount: new Set(archetypes.map((item) => item.regionId)).size, archetypes, zeroWordSample: regions.filter((item) => item.dialectCount === 0).slice(0, 10) });
console.log(JSON.stringify({ regions: regions.length, zero: output.zeroWordRegions, oneOrTwo: output.oneOrTwoWordRegions, max: `${max.prefectureName}/${max.regionName}:${max.dialectCount}`, median, archetypes: archetypes.map((item) => `${item.type}:${item.prefectureName}/${item.regionName}`) }, null, 2));
