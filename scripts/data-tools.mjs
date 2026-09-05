import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
const root = new URL("../src/data/", import.meta.url);
const dialectDir = new URL("dialects/", root);
const files = (await readdir(dialectDir))
  .filter((file) => file.endsWith(".json"))
  .sort();
const regions = JSON.parse(
  await readFile(new URL("regions.json", root), "utf8"),
);
const records = (
  await Promise.all(
    files.map(async (file) =>
      JSON.parse(await readFile(new URL(file, dialectDir), "utf8")),
    ),
  )
).flat();
const prefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];
const supportedStatus = new Set([
  "verified",
  "reference_confirmed",
  "community_confirmed",
  "needs_review",
  "demo_candidate",
]);
const supportedFrequency = new Set([
  "common",
  "occasional",
  "rare",
  "historical",
  "unknown",
]);
const errors = [];
const warnings = [];
const normalize = (value) =>
  value
    .normalize("NFKC")
    .trim()
    .replace(/[\sー・]/g, "")
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .toLowerCase();
const seenId = new Set(),
  seenSlug = new Set(),
  seenCandidate = new Map();
for (const item of records) {
  const where = item.id || "(no id)";
  if (seenId.has(item.id)) errors.push(`duplicate id: ${where}`);
  seenId.add(item.id);
  if (seenSlug.has(item.slug)) errors.push(`duplicate slug: ${item.slug}`);
  seenSlug.add(item.slug);
  if (!item.phrase?.trim()) errors.push(`empty phrase: ${where}`);
  if (!item.standardJapanese?.trim())
    errors.push(`empty standardJapanese: ${where}`);
  if (
    item.phrase !== item.phrase?.trim() ||
    item.standardJapanese !== item.standardJapanese?.trim()
  )
    errors.push(`outer whitespace: ${where}`);
  if (
    !prefectures.includes(item.prefectureName) ||
    item.prefectureCode !== prefectures.indexOf(item.prefectureName) + 1
  )
    errors.push(`invalid prefecture: ${where}`);
  if (!regions[item.prefectureName]?.includes(item.regionName))
    errors.push(`orphan region: ${where}`);
  if (!supportedStatus.has(item.verificationStatus))
    errors.push(`unsupported status: ${where}`);
  if (!supportedFrequency.has(item.usageFrequency))
    errors.push(`unsupported frequency: ${where}`);
  if (
    !item.ageGroups?.every((age) =>
      ["unknown", "10〜30代", "40〜60代", "70代以上", "全年代"].includes(age),
    )
  )
    errors.push(`unknown age group: ${where}`);
  if (!item.usageContexts?.length)
    errors.push(`missing usage context: ${where}`);
  const hasExample = Boolean(item.exampleDialect?.trim() && item.exampleStandard?.trim());
  if (!hasExample && item.evidenceScopes?.includes("example"))
    errors.push(`example evidence without example text: ${where}`);
  else if (!hasExample)
    warnings.push(`example awaiting confirmation: ${where}`);
  if (!item.description?.trim()) errors.push(`missing description: ${where}`);
  for (const key of [
    "phrase",
    "standardJapanese",
    "description",
    "exampleDialect",
    "exampleStandard",
  ])
    if ((item[key]?.length ?? 0) > 500)
      errors.push(`too long ${key}: ${where}`);
  for (const key of ["audioUrl", "videoUrl"])
    if (item[key] && !/^https:\/\//.test(item[key]))
      errors.push(`invalid ${key}: ${where}`);
  const candidate = [
    item.prefectureCode,
    item.regionName,
    normalize(item.phrase),
    normalize(item.reading),
    normalize(item.standardJapanese),
  ].join("|");
  if (seenCandidate.has(candidate))
    warnings.push(
      `duplicate candidate: ${seenCandidate.get(candidate)} / ${where}`,
    );
  else seenCandidate.set(candidate, where);
  if (item.verificationStatus === "needs_review" && !item.sourceNote)
    warnings.push(`review item without note: ${where}`);
  const evidenceScopes = new Set(item.evidenceScopes ?? []);
  for (const scope of evidenceScopes)
    if (!["phrase", "reading", "meaning", "region", "example", "usage", "history"].includes(scope))
      errors.push(`unsupported evidence scope ${scope}: ${where}`);
  if (evidenceScopes.size && (!item.sourceTitle || !item.sourceUrl || !item.sourceCheckedAt))
    errors.push(`evidence without complete source metadata: ${where}`);
  for (const source of item.additionalSources ?? []) {
    if (!source.title || !source.url || !source.checkedAt)
      errors.push(`incomplete additional source: ${where}`);
    for (const scope of source.evidenceScopes ?? [])
      if (!["phrase", "reading", "meaning", "region", "example", "usage", "history"].includes(scope))
        errors.push(`unsupported additional evidence scope ${scope}: ${where}`);
  }
}
for (const name of prefectures) {
  if (!Array.isArray(regions[name]) || regions[name].length < 2)
    errors.push(`insufficient regions: ${name}`);
}
const baseCounts = { 青森県: 8, 大阪府: 7 };
const counts = Object.fromEntries(
  prefectures.map((name) => [
    name,
    (baseCounts[name] ?? 0) +
      records.filter((item) => item.prefectureName === name).length,
  ]),
);
if (process.argv[2] === "stats") {
  for (const [name, count] of Object.entries(counts))
    console.log(`${name}: ${count}`);
  console.log(`TOTAL: ${Object.values(counts).reduce((a, b) => a + b, 0)}`);
  console.log(
    `national JSON verification: needs_review=${records.filter((x) => x.verificationStatus === "needs_review").length}`,
  );
  console.log(
    `regions=${Object.values(regions).flat().length}, conversations=8, quizzes=10`,
  );
} else {
  console.log(
    `validated ${records.length} national JSON records across ${files.length} prefecture files`,
  );
  for (const warning of warnings) console.warn(`WARN ${warning}`);
  for (const error of errors) console.error(`ERROR ${error}`);
  console.log(`errors=${errors.length} warnings=${warnings.length}`);
  if (errors.length) process.exitCode = 1;
}
