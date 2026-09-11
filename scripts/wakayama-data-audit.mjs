import { readFile } from "node:fs/promises";

const records = JSON.parse(
  await readFile(new URL("../src/data/dialects/wakayama.json", import.meta.url), "utf8"),
);
const errors = [];
const required = [
  "id", "slug", "phrase", "reading", "standardJapanese", "description",
  "exampleDialect", "exampleStandard", "prefectureCode", "prefectureName",
  "regionName", "languageVariety", "usageFrequency", "verificationStatus",
  "sourceType", "sourceTitle", "sourceOrganization", "sourceUrl",
  "sourceCheckedAt", "evidenceScopes",
];
const regions = new Set(["紀北", "紀中", "紀南", "県内複数地域"]);
const statuses = new Set(["verified", "reference_confirmed", "community_confirmed", "needs_review", "demo_candidate"]);
const scopes = new Set(["phrase", "reading", "meaning", "region", "example", "usage", "history"]);
const varieties = new Set(["japanese_dialect"]);
const singleRegions = new Set(["紀北", "紀中", "紀南"]);
const ids = new Set();
const slugs = new Set();
const claims = new Map();
const outsideWakayama = ["三重県", "東紀州", "尾鷲", "熊野市", "御浜町", "紀宝町"];

for (const record of records) {
  const where = record.id ?? "(missing id)";
  for (const key of required) if (!(key in record)) errors.push(`${where}: missing ${key}`);
  if (record.prefectureCode !== 30) errors.push(`${where}: prefectureCode is not 30`);
  if (record.prefectureName !== "和歌山県") errors.push(`${where}: prefectureName mismatch`);
  if (!regions.has(record.regionName)) errors.push(`${where}: invalid regionName`);
  if (!statuses.has(record.verificationStatus)) errors.push(`${where}: invalid verificationStatus`);
  if (!varieties.has(record.languageVariety)) errors.push(`${where}: invalid languageVariety`);
  if (!record.evidenceScopes?.every((scope) => scopes.has(scope))) errors.push(`${where}: invalid evidenceScopes`);
  if (ids.has(record.id)) errors.push(`${where}: duplicate id`);
  ids.add(record.id);
  if (slugs.has(record.slug)) errors.push(`${where}: duplicate slug`);
  slugs.add(record.slug);
  if (record.verificationStatus !== "needs_review" && !record.sourceUrl?.trim()) errors.push(`${where}: empty public sourceUrl`);
  if (/google\.|bing\.|search\?|\/search\//i.test(record.sourceUrl ?? "")) errors.push(`${where}: search-result sourceUrl`);
  if (record.reading?.trim() && !record.evidenceScopes?.includes("reading")) errors.push(`${where}: unsupported reading`);
  if (Boolean(record.exampleDialect?.trim()) !== Boolean(record.exampleStandard?.trim())) errors.push(`${where}: one-sided example`);
  if (record.evidenceScopes?.includes("example") && !(record.exampleDialect?.trim() && record.exampleStandard?.trim())) errors.push(`${where}: unsupported example`);
  if (singleRegions.has(record.regionName) && !record.evidenceScopes?.includes("region")) errors.push(`${where}: unsupported region`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.sourceCheckedAt ?? "")) errors.push(`${where}: invalid sourceCheckedAt`);
  const evidenceText = `${record.locality ?? ""} ${record.sourceNote ?? ""} ${record.sourceTitle ?? ""}`;
  if (outsideWakayama.some((name) => evidenceText.includes(name))) errors.push(`${where}: possible non-Wakayama evidence`);
  const claim = `${record.phrase}\u0000${record.standardJapanese}\u0000${record.regionName}`;
  if (claims.has(claim)) errors.push(`${where}: duplicate phrase + meaning + region with ${claims.get(claim)}`);
  claims.set(claim, where);
}

const counts = Object.fromEntries([...regions].map((region) => [region, records.filter((r) => r.regionName === region).length]));
console.log(`Wakayama records=${records.length}`);
console.log(`紀北=${counts["紀北"]} 紀中=${counts["紀中"]} 紀南=${counts["紀南"]} 県内複数地域=${counts["県内複数地域"]}`);
for (const error of errors) console.error(`ERROR ${error}`);
console.log(`errors=${errors.length}`);
if (errors.length) process.exitCode = 1;
