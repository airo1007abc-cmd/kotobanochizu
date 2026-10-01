const text = (value) => typeof value === "string" && value.trim().length > 0;
const sourcesFor = (item) =>
  [
    item.source ?? {
      title: item.sourceTitle,
      url: item.sourceUrl,
      checkedAt: item.sourceCheckedAt,
      evidenceScopes: item.evidenceScopes,
    },
    ...(item.additionalSources ?? []),
  ].filter(
    (s) =>
      s &&
      text(s.title) &&
      text(s.url) &&
      /^https?:\/\//.test(s.url) &&
      text(s.checkedAt),
  );
export const hasEvidenceScope = (item, scope) =>
  sourcesFor(item).some((source) => source.evidenceScopes?.includes(scope));
export const hasCoreEvidence = (item) =>
  Boolean(
    item &&
    ["verified", "reference_confirmed", "community_confirmed"].includes(
      item.verificationStatus,
    ) &&
    text(item.phrase) &&
    text(item.standardJapanese) &&
    ["phrase", "meaning", "region"].every((scope) =>
      hasEvidenceScope(item, scope),
    ),
  );
// Keep the searchable cohort to records that can answer meaning, reading,
// usage, and example intent with claim-level evidence. Records that do not
// meet this quality floor remain public and navigable, but are not included in
// the sitemap and render noindex,follow until their evidence is completed.
export const isIndexableRecord = (item) =>
  Boolean(
    hasCoreEvidence(item) &&
    item.description?.trim().length >= 100 &&
    text(item.exampleDialect) &&
    text(item.exampleStandard) &&
    ["reading", "example", "usage"].every((scope) =>
      hasEvidenceScope(item, scope),
    ),
  );
