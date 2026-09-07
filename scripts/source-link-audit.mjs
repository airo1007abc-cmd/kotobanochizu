import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
const raw = (
  await Promise.all(
    (await readdir("src/data/dialects"))
      .filter((f) => f.endsWith(".json"))
      .map(async (f) =>
        JSON.parse(await readFile("src/data/dialects/" + f, "utf8")),
      ),
  )
).flat();
const urls = [
  ...new Set(
    raw
      .flatMap((d) => [
        d.sourceUrl,
        ...(d.additionalSources ?? []).map((s) => s.url),
      ])
      .filter(Boolean),
  ),
];
const results = [];
const previous = process.argv.includes("--retry")
  ? JSON.parse(await readFile("reports/site-audit/sources.json", "utf8"))
      .results
  : [];
const publicUrl = (value) => {
  const url = new URL(value);
  if ([...url.searchParams.keys()].some((key) => /^x-amz-/i.test(key)))
    url.search = "";
  return url.href;
};
let cursor = 0;
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      const prior = previous.find(
        (r) => r.url === url && r.status >= 200 && r.status < 400,
      );
      if (prior) {
        results.push({ ...prior, finalUrl: publicUrl(prior.finalUrl) });
        continue;
      }
      try {
        let response = await fetch(url, {
          method: "HEAD",
          signal: AbortSignal.timeout(12000),
          redirect: "follow",
        });
        let method = "HEAD";
        if (response.status >= 400) {
          response = await fetch(url, {
            signal: AbortSignal.timeout(20000),
            redirect: "follow",
          });
          method = "GET";
          await response.body?.cancel();
        }
        results.push({
          url,
          status: response.status,
          method,
          finalUrl: publicUrl(response.url),
        });
      } catch (error) {
        results.push({ url, status: 0, error: String(error) });
      }
      if (results.length % 40 === 0)
        console.log(`Source URLs: ${results.length}/${urls.length}`);
    }
  }),
);
const duplicateReview = JSON.parse(
  await readFile("reports/dialect-duplicate-review.json", "utf8"),
);
const duplicateReassessment = duplicateReview.groups
  .filter((g) => g.classification === "TRUE_DUPLICATE")
  .map((g) => ({
    ids: g.pages.map((p) => p.id),
    decision: "KEEP_SEPARATE_HOLD_MERGE",
    reason:
      "既存の記録地点・話者・資料注記に差がある。表記・意味・閲覧区分の一致だけでは同一記録と認定しない。",
    records: g.pages.map((p) => {
      const d = raw.find((d) => d.id === p.id);
      return {
        id: d.id,
        municipality: d.municipality,
        description: d.description,
        sourceNote: d.sourceNote,
        sourceUrl: d.sourceUrl,
      };
    }),
  }));
const output = {
  generatedAt: new Date().toISOString(),
  scope:
    "URL availability and repository evidence metadata; not a re-verification of every linguistic claim",
  records: raw.length,
  missingSource: raw
    .filter((d) => !d.sourceTitle || !d.sourceUrl || !d.sourceCheckedAt)
    .map((d) => d.id),
  missingReading: raw.filter((d) => !d.reading).length,
  missingExample: raw.filter((d) => !d.exampleDialect || !d.exampleStandard)
    .length,
  unknownLanguage: raw
    .filter((d) => d.languageVariety === "unknown")
    .map((d) => d.id),
  sourceUrls: urls.length,
  success: results.filter((r) => r.status >= 200 && r.status < 400).length,
  reviewRequired: results.filter((r) => r.status === 0 || r.status >= 400),
  duplicateReassessment,
  results,
};
await mkdir("reports/site-audit", { recursive: true });
await writeFile(
  "reports/site-audit/sources.json",
  JSON.stringify(output, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    urls: urls.length,
    success: output.success,
    reviewRequired: output.reviewRequired.length,
    duplicateReassessments: duplicateReassessment.length,
  }),
);
