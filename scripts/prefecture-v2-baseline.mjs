import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
const priority = read("reports/dialect-content-priority.json").records;
const regionCatalog = read("src/data/regions.json");
const files = fs.readdirSync(path.join(root, "src/data/dialects")).filter((file) => file.endsWith(".json"));
const dialects = files.flatMap((file) => read(`src/data/dialects/${file}`));
const prefectures = Object.keys(regionCatalog).map((name, index) => ({ id: `p${index + 1}`, code: index + 1, name }));

const baseline = prefectures.map((prefecture) => {
  const audits = priority.filter((record) => record.prefecture === prefecture.name);
  const items = dialects.filter((dialect) => dialect.prefectureName === prefecture.name);
  const regionNames = regionCatalog[prefecture.name] ?? [];
  const varieties = [...new Set(items.map((item) => item.languageVariety ?? "unknown"))].sort();
  const verified = items.filter((item) => ["verified", "reference_confirmed", "community_confirmed", "reviewed"].includes(item.verificationStatus)).length;
  const sourced = audits.filter((record) => record.sourceCount > 0).length;
  const longestRegionName = [...regionNames].sort((a, b) => b.length - a.length)[0] ?? "";
  const longestWord = [...audits].sort((a, b) => b.word.length - a.word.length)[0]?.word ?? "";
  return {
    prefectureId: prefecture.id,
    prefectureCode: prefecture.code,
    prefectureName: prefecture.name,
    dialectCount: audits.length,
    regionCount: regionNames.length,
    regionNames,
    indexableCount: audits.filter((record) => record.indexStatus === "indexable").length,
    noindexCount: audits.filter((record) => record.indexStatus === "noindex").length,
    sourceCount: sourced,
    sourceCoverage: audits.length ? Number((sourced / audits.length).toFixed(4)) : 0,
    verifiedCount: verified,
    verificationCoverage: audits.length ? Number((verified / audits.length).toFixed(4)) : 0,
    longestRegionName,
    longestRegionNameLength: longestRegionName.length,
    longestWord,
    longestWordLength: longestWord.length,
    languageVarietyCount: varieties.length,
    languageVarieties: varieties,
    islandRegionCount: regionNames.filter((name) => /島|壱岐|対馬|五島|奄美|甑/.test(name)).length,
  };
});

write("reports/prefecture-v2-baseline.json", { generatedAt: "2026-09-05", totalPrefectures: baseline.length, totalDialects: baseline.reduce((sum, item) => sum + item.dialectCount, 0), prefectures: baseline });

const pick = (type, item, reason) => ({ type, prefectureId: item.prefectureId, prefectureName: item.prefectureName, reason, metrics: item });
const maxDialect = [...baseline].sort((a, b) => b.dialectCount - a.dialectCount)[0];
const maxRegions = [...baseline].sort((a, b) => b.regionCount - a.regionCount)[0];
const minRegions = [...baseline].sort((a, b) => a.regionCount - b.regionCount || b.dialectCount - a.dialectCount)[0];
const longRegion = [...baseline].sort((a, b) => b.longestRegionNameLength - a.longestRegionNameLength)[0];
const lowCoverage = [...baseline].filter((item) => item.dialectCount > 0).sort((a, b) => a.sourceCoverage - b.sourceCoverage || a.verificationCoverage - b.verificationCoverage)[0];
const byName = (name) => baseline.find((item) => item.prefectureName === name);
const island = [...baseline].sort((a, b) => b.islandRegionCount - a.islandRegionCount || b.regionCount - a.regionCount)[0];
const archetypes = [
  pick("A_MAX_DIALECTS", maxDialect, `方言数最多: ${maxDialect.dialectCount}件`),
  pick("B_MAX_REGIONS", maxRegions, `地域数最多: ${maxRegions.regionCount}地域`),
  pick("C_MIN_REGIONS", minRegions, `地域数最少: ${minRegions.regionCount}地域`),
  pick("D_LONG_REGION_NAME", longRegion, `最長地域名${longRegion.longestRegionNameLength}文字`),
  pick("E_LOW_SOURCE_COVERAGE", lowCoverage, `出典率${Math.round(lowCoverage.sourceCoverage * 100)}%・確認率${Math.round(lowCoverage.verificationCoverage * 100)}%`),
  pick("F_OKINAWA", byName("沖縄県"), "languageVarietyと島嶼地域を保持する検証"),
  pick("G_KAGOSHIMA", byName("鹿児島県"), "薩摩・大隅・島嶼・奄美を保持する検証"),
  pick("H_ISLAND_REGIONS", island, `島嶼関連地域${island.islandRegionCount}件`),
  pick("I_SAGA_BASELINE", byName("佐賀県"), "既存V2 baseline"),
];
write("reports/prefecture-v2-archetypes.json", { generatedAt: "2026-09-05", selectedCount: archetypes.length, uniquePrefectureCount: new Set(archetypes.map((item) => item.prefectureId)).size, archetypes });
console.log(JSON.stringify({ prefectures: baseline.length, dialects: baseline.reduce((sum, item) => sum + item.dialectCount, 0), archetypes: archetypes.map((item) => `${item.type}:${item.prefectureName}`) }, null, 2));
