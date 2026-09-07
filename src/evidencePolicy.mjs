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
export const hasCoreEvidence = (item) =>
  Boolean(
    item &&
    ["verified", "reference_confirmed", "community_confirmed"].includes(
      item.verificationStatus,
    ) &&
    text(item.phrase) &&
    text(item.standardJapanese) &&
    ["phrase", "meaning", "region"].every((scope) =>
      sourcesFor(item).some((s) => s.evidenceScopes?.includes(scope)),
    ),
  );
// Preserve the existing publication cohort. Other records require individual
// editorial review of their unique evidence, not invented readings or examples.
export const isIndexableRecord = (item) =>
  Boolean(
    hasCoreEvidence(item) &&
    item.description?.trim().length >= 100 &&
    text(item.exampleDialect) &&
    text(item.exampleStandard) &&
    ["reading", "example", "usage"].every((scope) =>
      sourcesFor(item).some((s) => s.evidenceScopes?.includes(scope)),
    ),
  );
