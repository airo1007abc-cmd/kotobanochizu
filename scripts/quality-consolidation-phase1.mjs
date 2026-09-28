import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const json = async (path) => JSON.parse(await readFile(join(root, path), "utf8"));
const files = (await readdir(join(root, "src/data/dialects"))).filter((name) => name.endsWith(".json")).sort();
const perFile = await Promise.all(files.map((name) => json(`src/data/dialects/${name}`)));
const canonical = perFile.flat();
const fileById = new Map(perFile.flatMap((rows, index) => rows.map((row) => [row.id, files[index]])));
const content = await json("reports/dialect-v2-content-audit.json");
const priority = await json("reports/dialect-content-priority.json");
const indexability = await json("reports/indexability-audit.json");
const seo = await json("reports/seo-site-audit.json");
const routes = await json("tmp/site-audit/route-decisions.json");
const canonicalById = new Map(canonical.map((record) => [record.id, record]));
const priorityById = new Map(priority.records.map((record) => [record.id, record]));
const routeByPath = new Map(routes.map((route) => [route.path, route]));
const issueById = new Map(content.issues.map((issue) => [issue.id, issue.issues]));
const normalize = (value) => String(value ?? "").normalize("NFKC").toLowerCase().replace(/[\s　・ー]/g, "").replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
const countBy = (items, key) => Object.fromEntries([...Map.groupBy(items, key)].map(([value, group]) => [value, group.length]).sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "ja")));
const sourceFor = (record) => record?.source ?? (record?.sourceUrl ? { title: record.sourceTitle, url: record.sourceUrl, checkedAt: record.sourceCheckedAt, evidenceScopes: record.evidenceScopes } : null);
const batchFor = (record) => {
  const source = sourceFor(record);
  if (!source?.url) return "source_pending";
  return `${new URL(source.url).hostname} | ${source.title ?? "untitled"}`;
};
const pathFor = (id) => `/dialects/${id}`;
const missingSource = priority.sourceMissingRecords.map((row) => {
  const record = canonicalById.get(row.id);
  const peers = priority.records.filter((other) => other.id !== row.id && normalize(other.word) === normalize(row.word))
    .map((other) => ({ id: other.id, prefecture: other.prefecture, region: other.region, meaning: other.meaning, sourceCount: other.sourceCount, indexStatus: other.indexStatus }));
  return {
    id: row.id, word: row.word, meaning: row.meaning, prefecture: row.prefecture, region: row.region,
    population: record ? "canonical" : "retained_legacy", lineage: record ? `src/data/dialects/${fileById.get(row.id)}` : "src/data.ts or src/extendedData.ts (legacy seed)",
    route: pathFor(row.id), indexable: routeByPath.get(pathFor(row.id))?.indexable ?? false,
    verificationStatus: row.verificationStatus, sourceMetadata: sourceFor(record), evidenceScopes: row.evidenceScopes,
    claimReview: { phrase: "unverified", meaning: "unverified", region: "unverified", reading: "unverified", example: "unverified" },
    sameWordRecords: peers, outcome: "HOLD", note: "No source currently recorded for this exact record and all relevant claims; a same-word peer does not establish this region or sense. Keep noindex pending claim-level source review.",
  };
});
const debt = (issueName) => {
  const rows = [...issueById].filter(([, issues]) => issues.includes(issueName)).map(([id]) => priorityById.get(id)).filter(Boolean);
  return { total: rows.length, byPrefecture: countBy(rows, (row) => row.prefecture), bySourceBatch: countBy(rows, (row) => batchFor(canonicalById.get(row.id))),
    withClaimScopeButMissingContent: rows.filter((row) => (canonicalById.get(row.id)?.evidenceScopes ?? []).includes(issueName === "missing_reading" ? "reading" : "example")).length,
    sourceClaimNotEstablished: rows.filter((row) => !(canonicalById.get(row.id)?.evidenceScopes ?? []).includes(issueName === "missing_reading" ? "reading" : "example")).length };
};
const reasonById = new Map();
for (const route of routes.filter((route) => route.path.startsWith("/dialects/") && !route.indexable)) {
  const id = route.path.slice("/dialects/".length);
  const record = canonicalById.get(id);
  let reason = "dialect_legacy_or_archived";
  if (record) {
    if (indexability.dialects.identityCollisions.some((group) => group.ids.includes(id))) reason = "dialect_identity_collision";
    else if (!["verified", "reference_confirmed", "community_confirmed"].includes(record.verificationStatus)) reason = "dialect_verification_status";
    else reason = "dialect_missing_core_meaning";
  }
  reasonById.set(id, reason);
}
const duplicateGroups = [...seo.duplicateTitles.map((group) => ({ kind: "title", ...group })), ...seo.duplicateDescriptions.map((group) => ({ kind: "description", ...group }))];
const report = {
  baseCommit: execFileSync("git", ["rev-parse", "origin/main"], { cwd: root, encoding: "utf8" }).trim(),
  populations: { canonical: canonical.length, contentAudit: content.total, retainedLegacy: priority.records.filter((row) => !canonicalById.has(row.id)).length,
    definition: "Canonical is the 47 prefecture JSON files. Content and priority audits include canonical plus retained legacy seeds from src/data.ts and src/extendedData.ts after repository replacement/phrase filtering. Archived or redirected legacy routes are route counts, not extra content records.",
    retainedLegacyIds: priority.records.filter((row) => !canonicalById.has(row.id)).map((row) => row.id) },
  missingSource: { total: missingSource.length, recovered: missingSource.filter((row) => row.outcome === "RECOVERED").length, hold: missingSource.filter((row) => row.outcome === "HOLD").length, records: missingSource },
  debt: { reading: debt("missing_reading"), example: debt("missing_example"), contentIssueRecords: content.contentAuditDialectCount,
    rawMissingReading: priority.records.filter((row) => !row.hasReading).length,
    rawMissingExample: priority.records.filter((row) => !row.hasExample).length,
    note: "Content audit issues measure unevidenced published fields; priority CSV hasReading/hasExample measure raw nonempty strings, so their missing counts differ. Claim presence in an external source is not inferred from source metadata." },
  indexability: { canonicalRecordEligible: indexability.dialects.recordEligible, indexableDialectRoutes: indexability.dialects.routeIndexable,
    noindexDialectRoutes: reasonById.size, reasonCounts: countBy([...reasonById.values()], (value) => value), records: Object.fromEntries(reasonById),
    identityPairs: indexability.dialects.identityCollisions.map((group) => ({ ids: group.ids, records: group.ids.map((id) => {
      const record = canonicalById.get(id);
      return { id, phrase: record.phrase, meaning: record.standardJapanese, region: record.regionName,
        municipality: record.municipality ?? null, reading: record.reading ?? "", sourceUrl: sourceFor(record)?.url ?? null,
        sourceNote: record.sourceNote ?? "", description: record.description ?? "" };
    }) })) },
  seo: { duplicateTitleGroups: seo.duplicateTitles.length, duplicateDescriptionGroups: seo.duplicateDescriptions.length,
    blockingTitleGroups: seo.blockingDuplicateTitles.length, blockingDescriptionGroups: seo.blockingDuplicateDescriptions.length,
    groups: duplicateGroups.map((group) => ({ kind: group.kind, paths: group.paths, indexablePaths: group.indexablePaths,
      verdict: group.indexablePaths.length > 1 ? "REVIEW_INDEXABLE" : "HOLD_NOINDEX_OR_REDIRECT" })) },
};
if (report.populations.canonical + report.populations.retainedLegacy !== report.populations.contentAudit) throw new Error("Population mismatch");
if (report.missingSource.total !== content.warnings.missingSource) throw new Error("Missing source mismatch");
if (report.debt.reading.total !== content.warnings.missingReading || report.debt.example.total !== content.warnings.missingExample) throw new Error("Debt mismatch");
if (report.indexability.noindexDialectRoutes !== indexability.dialects.routeNoindex) throw new Error("Route mismatch");
for (const [reason, count] of Object.entries(report.indexability.reasonCounts)) {
  if (indexability.remainingNoindexRouteReasons[reason] !== count) throw new Error(`Noindex reason mismatch: ${reason}`);
}
await writeFile(join(root, "reports/quality-consolidation-phase1.json"), `${JSON.stringify(report, null, 2)}\n`);
const table = (headers, rows) => `| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n${rows.map((row) => `| ${row.map((cell) => String(cell ?? "").replaceAll("|", "\\|")).join(" | ")} |`).join("\n")}`;
const md = `# Quality Consolidation Phase 1\n\nGenerated from current repository data by \`node scripts/quality-consolidation-phase1.mjs\`. Base: \`${report.baseCommit}\`.\n\n## Population\n\n- Canonical prefecture JSON records: **${report.populations.canonical}**.\n- Content audit and priority audit records: **${report.populations.contentAudit}** = canonical ${report.populations.canonical} + retained legacy ${report.populations.retainedLegacy}.\n- Retained legacy IDs: ${report.populations.retainedLegacyIds.map((id) => `\`${id}\``).join(", ")}. The 21 legacy/archived noindex routes are a route population, not 21 additional content records.\n\n## Missing source: ${report.missingSource.total}\n\nRecovered: **${report.missingSource.recovered}**; HOLD: **${report.missingSource.hold}**. A matching word in another record or a web search hit does not establish the exact meaning, region, reading, and example. No source has been attached to a record without direct claim-level verification. All 26 routes remain noindex. Each row below identifies the current claim, lineage, source metadata, related sourced records, and public route. "None" under source metadata means no recorded source. Reading and example claims also remain unverified even where legacy seed strings exist.\n\n${table(["ID / public route", "Claim: word → meaning", "Region", "Population / lineage", "Current state", "Same-word sourced IDs", "Decision"], report.missingSource.records.map((row) => [
  `[${row.id}](https://kotobanochizu.jp${row.route})`, `${row.word} → ${row.meaning}`, `${row.prefecture}・${row.region}`, `${row.population}; \`${row.lineage}\``, `noindex; ${row.verificationStatus}; source metadata: ${row.sourceMetadata ? "present" : "none"}; evidence scopes: ${row.evidenceScopes.join(", ") || "none"}`, row.sameWordRecords.filter((peer) => peer.sourceCount).map((peer) => peer.id).join(", ") || "none", row.outcome]))}\n\n## Reading and example debt\n\nContent audit: reading **${report.debt.reading.total}**, example **${report.debt.example.total}**, records with at least one content issue **${report.debt.contentIssueRecords}**. These are content-audit decisions, not a count of empty JSON strings. Raw empty-string counts in the priority audit are reading ${report.debt.rawMissingReading} / example ${report.debt.rawMissingExample}. Reading ${report.debt.reading.withClaimScopeButMissingContent} and example ${report.debt.example.withClaimScopeButMissingContent} records have a corresponding evidence scope despite the audit issue; inspect these records and the actual source first for possible ingestion/mapping gaps. For the remaining ${report.debt.reading.sourceClaimNotEstablished} reading and ${report.debt.example.sourceClaimNotEstablished} example cases, source metadata does not establish that the source contains the missing claim. Source documents still require human inspection; no claim is inferred from a title or URL.\n\n${table(["Prefecture", "Reading", "Example"], [...new Set([...Object.keys(report.debt.reading.byPrefecture), ...Object.keys(report.debt.example.byPrefecture)])].map((name) => [name, report.debt.reading.byPrefecture[name] ?? 0, report.debt.example.byPrefecture[name] ?? 0]).sort((a, b) => b[1] + b[2] - a[1] - a[2]))}\n\n### Largest source batches\n\n${table(["Source batch", "Reading", "Example"], [...new Set([...Object.keys(report.debt.reading.bySourceBatch), ...Object.keys(report.debt.example.bySourceBatch)])].map((name) => [name, report.debt.reading.bySourceBatch[name] ?? 0, report.debt.example.bySourceBatch[name] ?? 0]).sort((a, b) => b[1] + b[2] - a[1] - a[2]).slice(0, 20))}\n\n## Indexability and identity\n\nCanonical eligible records: **${report.indexability.canonicalRecordEligible}**; indexable dialect routes: **${report.indexability.indexableDialectRoutes}**; noindex dialect routes: **${report.indexability.noindexDialectRoutes}**. These route reasons are mutually exclusive by the current route-policy precedence; missing-source is a content issue, not an additional route-reason bucket.\n\n${table(["Primary route reason", "Count", "IDs"], Object.entries(report.indexability.reasonCounts).map(([reason, count]) => [reason, count, Object.entries(report.indexability.records).filter(([, value]) => value === reason).map(([id]) => id).join(", ")]))}\n\nThe 14 identity-collision routes form seven pairs. Their current key includes spelling, meaning, place, source URL and page but not reading or grammatical function. Review source pages and those two fields before any merge or canonical change; all remain noindex.\n\n## SEO duplicates\n\nTitle groups: **${report.seo.duplicateTitleGroups}**; description groups: **${report.seo.duplicateDescriptionGroups}**; blocking groups: **${report.seo.blockingTitleGroups + report.seo.blockingDescriptionGroups}**. Every group has zero indexable paths, explaining the blocking=0 result. Two groups concern redirected/archived legacy pages; seven dialect pairs overlap the identity-collision review. The remaining description group is archived conversations. No title, slug, or canonical identity changes are justified by this audit alone.\n\n## Next research batches\n\n1. Resolve the 19 reading and 8 example scope/content mismatches by checking the exact record, cited document location, and ingestion mapping.\n2. Inspect high-volume source batches in the table above, recording whether each source actually contains reading or example claims before targeted imports. Start with Wakayama (${report.debt.reading.byPrefecture["和歌山県"] ?? 0} reading / ${report.debt.example.byPrefecture["和歌山県"] ?? 0} example), then the highest-volume source-specific groups.\n3. Review the seven collision pairs against their primary documents for region, sense, reading, grammar and source-page distinctions. Keep noindex until identity is resolved.\n4. Research the 26 source-pending records in region-specific batches. Existing same-word sources are leads only.\n5. In a separate expansion Goal, consider Akita and Mie (currently 17 canonical records each) to at least 30 with direct sources.\n`;
const identityTable = table(["IDs", "Shared spelling / meaning / region", "Reading", "Source distinction retained in notes"], report.indexability.identityPairs.map((pair) => [
  pair.ids.join(" / "), `${pair.records[0].phrase} / ${pair.records[0].meaning} / ${pair.records[0].region}`,
  pair.records.map((record) => record.reading || "unrecorded").join(" / "),
  pair.records.map((record) => record.sourceNote.split("掲載箇所:")[0].slice(0, 105)).join(" ⇔ "),
]));
const renderedMd = md.replace("## SEO duplicates", `${identityTable}\n\nSource notes distinguish speaker, place, accent pattern or usage limitation. These distinctions require primary-document review; identical public titles alone do not justify merging records.\n\n## SEO duplicates`);
await writeFile(join(root, "reports/quality-consolidation-phase1.md"), renderedMd);
console.log(JSON.stringify({ populations: report.populations, missingSource: { total: report.missingSource.total, recovered: report.missingSource.recovered, hold: report.missingSource.hold }, debt: { reading: report.debt.reading.total, example: report.debt.example.total }, indexability: report.indexability.reasonCounts, seo: { titles: report.seo.duplicateTitleGroups, descriptions: report.seo.duplicateDescriptionGroups } }, null, 2));
