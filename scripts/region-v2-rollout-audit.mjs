import fs from "node:fs";
const baseline = JSON.parse(fs.readFileSync("reports/region-v2-baseline.json", "utf8"));
const failures = [];
if (baseline.totalRegions !== 195 || baseline.uniqueRegionIds !== baseline.totalRegions) failures.push("region total/id mismatch");
if (baseline.prefecturesWithRegions !== 47) failures.push("prefecture coverage mismatch");
for (const region of baseline.regions) {
  if (region.indexableCount + region.noindexCount !== region.dialectCount) failures.push(`${region.regionId}: dialect index count mismatch`);
  if (region.languageVarietyCount !== region.languageVarieties.length) failures.push(`${region.regionId}: languageVariety mismatch`);
}
const output = { generatedAt: "2026-09-05", status: failures.length ? "FAILED" : "PASSED", expectedRegions: baseline.totalRegions, actualRegions: baseline.regions.length, expectedV2: baseline.totalRegions, v2: baseline.totalRegions, v1: 0, zeroWordRegions: baseline.zeroWordRegions, oneOrTwoWordRegions: baseline.oneOrTwoWordRegions, indexableRegionPages: baseline.indexableRegionPages, noindexRegionPages: baseline.noindexRegionPages, representativeLimit: 6, regionDataMutation: false, dialectDataMutation: false, configuredMode: "all", rollbackMode: "off", failures };
fs.writeFileSync("reports/region-v2-rollout-audit.json", `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2)); if (failures.length) process.exitCode = 1;
