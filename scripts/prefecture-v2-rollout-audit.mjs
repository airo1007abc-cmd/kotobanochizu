import fs from "node:fs";

const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const baseline = read("reports/prefecture-v2-baseline.json");
const priority = read("reports/dialect-content-priority.json").records;
const failures = [];

if (baseline.totalPrefectures !== 47) failures.push(`prefecture count: ${baseline.totalPrefectures}`);
if (baseline.totalDialects !== 1643) failures.push(`dialect count: ${baseline.totalDialects}`);
for (const prefecture of baseline.prefectures) {
  if (!prefecture.prefectureId || !prefecture.prefectureName) failures.push(`missing identity: ${prefecture.prefectureCode}`);
  if (prefecture.dialectCount < 1) failures.push(`empty dialects: ${prefecture.prefectureName}`);
  if (prefecture.regionCount < 1) failures.push(`empty regions: ${prefecture.prefectureName}`);
  if (prefecture.indexableCount + prefecture.noindexCount !== prefecture.dialectCount) failures.push(`index status mismatch: ${prefecture.prefectureName}`);
  if (prefecture.sourceCount > prefecture.dialectCount || prefecture.verifiedCount > prefecture.dialectCount) failures.push(`metric overflow: ${prefecture.prefectureName}`);
}

const indexable = priority.filter((item) => item.indexStatus === "indexable").length;
const noindex = priority.filter((item) => item.indexStatus === "noindex").length;
const output = {
  generatedAt: "2026-09-05",
  status: failures.length ? "FAILED" : "PASSED",
  expectedPrefectures: 47,
  actualPrefectures: baseline.totalPrefectures,
  expectedDialects: 1643,
  actualDialects: baseline.totalDialects,
  indexStatus: { indexable, noindex, total: indexable + noindex },
  v2Selection: { expected: 47, configuredMode: "all", rollbackMode: "off" },
  representativeLimit: 6,
  contentMutation: false,
  regionClassificationMutation: false,
  failures,
  prefectures: baseline.prefectures.map((item) => ({
    id: item.prefectureId,
    name: item.prefectureName,
    dialectCount: item.dialectCount,
    regionCount: item.regionCount,
    indexableCount: item.indexableCount,
    noindexCount: item.noindexCount,
    sourceCount: item.sourceCount,
    verifiedCount: item.verifiedCount,
    languageVarieties: item.languageVarieties,
  })),
};
write("reports/prefecture-v2-rollout-audit.json", output);
console.log(JSON.stringify({ status: output.status, prefectures: output.actualPrefectures, dialects: output.actualDialects, failures: failures.length }, null, 2));
if (failures.length) process.exitCode = 1;
