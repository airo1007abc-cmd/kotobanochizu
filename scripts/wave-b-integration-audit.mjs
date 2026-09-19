import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { hasCoreEvidence, hasEvidenceScope } from "../src/evidencePolicy.mjs";
import { createDialectRoutePolicy } from "../src/dialectRoutePolicy.mjs";

// Pass the fetched integration baseline, never a catalogue count.
const baseline = process.argv[2];
if (!/^[a-f0-9]{40}$/.test(baseline ?? "")) throw new Error("Pass the full baseline commit SHA");
const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const files = fs.readdirSync("src/data/dialects").filter((f) => f.endsWith(".json"));
const before = files.flatMap((f) => JSON.parse(execFileSync("git", ["show", `${baseline}:src/data/dialects/${f}`], { encoding: "utf8" })));
const records = files.flatMap((f) => read(`src/data/dialects/${f}`));
const oldIds = new Set(before.map((r) => r.id));
const added = records.filter((r) => !oldIds.has(r.id));
const regions = read("src/data/regions.json");
const policy = createDialectRoutePolicy(records);
const routes = read("tmp/site-audit/route-decisions.json");
const byRoute = new Map(routes.map((r) => [r.path, r]));
const root = "research/expansion-2026-09-19-wave-b";
const baselineSnapshot = read(`${root}/integration-baseline.json`);
if (baselineSnapshot.baseline !== baseline || baselineSnapshot.canonical !== before.length) throw new Error("Baseline snapshot mismatch");
const siteAudit = read("reports/seo-site-audit.json");
const sourceUrl = (d) => typeof d.source === "string" ? d.source : d.source?.url;
const failures = [];
const prefectures = [];
const claims = [];
for (const slug of fs.readdirSync(root).filter((f) => fs.statSync(`${root}/${f}`).isDirectory())) {
  const decisions = read(`${root}/${slug}/candidate-decisions.json`);
  const current = read(`src/data/dialects/${slug}.json`);
  const news = current.filter((r) => !oldIds.has(r.id));
  const accepted = decisions.filter((d) => d.decision.toLowerCase() === "accepted");
  for (const d of decisions) {
    if (d.decision.toLowerCase() !== "accepted") {
      if ((d.canonicalId || d.proposedCanonicalId) && records.some((r) => r.id === (d.canonicalId || d.proposedCanonicalId))) failures.push([slug, "held/rejected ID in canonical", d]);
      continue;
    }
    const r = news.find((r) => r.id === d.canonicalId);
    if (!r || r.phrase !== d.phrase || sourceUrl(d) !== r.sourceUrl) failures.push([slug, "accepted mapping/source mismatch", d]);
  }
  for (const r of news) {
    const matches = accepted.filter((d) => d.canonicalId === r.id);
    if (matches.length !== 1) failures.push([r.id, "decision must be one-to-one"]);
    if (!regions[r.prefectureName]?.includes(r.regionName)) failures.push([r.id, "unknown browsing region"]);
    if (!hasCoreEvidence(r)) failures.push([r.id, "missing core evidence"]);
    if (!byRoute.get(`/dialects/${r.id}`)?.indexable) failures.push([r.id, "unexpected noindex"]);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.sourceCheckedAt ?? "")) failures.push([r.id, "invalid checkedAt"]);
    for (const [scope, stored] of [["reading", r.reading], ["example", r.exampleDialect || r.exampleStandard]]) {
      if (stored && !hasEvidenceScope(r, scope)) failures.push([r.id, "unsupported optional claim", scope]);
    }
    claims.push({ id: r.id, phrase: r.phrase, meaning: r.standardJapanese, browsingRegion: r.regionName,
      geography: { municipality: r.municipality, locality: r.locality, evidenceRegion: r.evidenceRegion, candidate: matches[0]?.evidenceGeography },
      source: { title: r.sourceTitle, url: r.sourceUrl, page: r.sourcePage, checkedAt: r.sourceCheckedAt },
      scopes: r.evidenceScopes, coreEligible: hasCoreEvidence(r), routeIndexable: byRoute.get(`/dialects/${r.id}`)?.indexable,
      optional: Object.fromEntries(["reading", "example", "usage", "history"].map((scope) => [scope, hasEvidenceScope(r, scope)])) });
  }
  prefectures.push({ slug, name: current[0].prefectureName, before: current.length - news.length, after: current.length, added: news.length,
    decisions: Object.fromEntries([...Map.groupBy(decisions, (d) => d.decision)].map(([k, v]) => [k, v.length])),
    regions: Object.fromEntries([...Map.groupBy(current, (r) => r.regionName)].map(([k, v]) => [k, v.length])) });
}
const duplicates = (field) => [...Map.groupBy(records, (r) => r[field])].filter(([, rs]) => rs.length > 1).map(([value, rs]) => ({ value, ids: rs.map((r) => r.id) }));
const norm = (value) => String(value ?? "").normalize("NFKC").toLowerCase().replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 96)).replace(/[\s・、。ー]/g, "");
const samePhrase = [];
for (const r of added) for (const o of records) {
  if (r.id !== o.id && norm(r.phrase) === norm(o.phrase) && (oldIds.has(o.id) || r.id < o.id)) samePhrase.push({ ids: [r.id, o.id], phrase: r.phrase, meanings: [r.standardJapanese, o.standardJapanese], prefectures: [r.prefectureName, o.prefectureName], geography: [r.evidenceRegion || r.locality || r.municipality || r.regionName, o.evidenceRegion || o.locality || o.municipality || o.regionName], sources: [r.sourceUrl, o.sourceUrl] });
}
const changedOld = before.filter((r) => JSON.stringify(r) !== JSON.stringify(records.find((n) => n.id === r.id))).map((r) => r.id);
const invariants = {
  duplicateIds: duplicates("id"), duplicateSlugs: duplicates("slug"), changedOld,
  indexableWithoutCore: records.filter((r) => byRoute.get(`/dialects/${r.id}`)?.indexable && !hasCoreEvidence(r)).map((r) => r.id),
  indexableIdentityCollisions: records.filter((r) => byRoute.get(`/dialects/${r.id}`)?.indexable && policy.collisionIds.has(r.id)).map((r) => r.id),
  newIdentityCollisions: added.filter((r) => policy.collisionIds.has(r.id)).map((r) => r.id), failures,
};
const countRoutes = (rs) => ({ dialectRoutes: rs.filter((r) => r.path.startsWith("/dialects/")).length, indexableDialectRoutes: rs.filter((r) => r.path.startsWith("/dialects/") && r.indexable).length, regionIndexable: rs.filter((r) => r.path.startsWith("/regions/") && r.indexable).length, staticPagesExcludingRedirects: rs.length, indexable: rs.filter((r) => r.indexable).length, noindexExcludingRedirects: rs.filter((r) => !r.indexable).length });
const report = { baseline, canonical: { before: before.length, after: records.length, added: added.length, differenceFrom3000: records.length - 3000 }, before: baselineSnapshot, routesAfter: { ...countRoutes(routes), staticPages: siteAudit.totalStaticPages, noindex: siteAudit.noindex, sitemapUrls: routes.filter((r) => r.indexable).length }, prefectures, invariants, legacyIdentityCollisions: policy.identityCollisions, samePhraseReview: samePhrase, claims };
fs.writeFileSync("reports/wave-b-integration-audit.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ canonical: report.canonical, addedCore: added.filter(hasCoreEvidence).length, addedIndexable: claims.filter((r) => r.routeIndexable).length, failures: Object.fromEntries(Object.entries(invariants).map(([k, v]) => [k, v.length])) }, null, 2));
if (Object.values(invariants).some((v) => v.length)) process.exitCode = 1;
