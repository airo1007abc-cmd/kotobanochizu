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
// Indexability follows the claims that define the record. Reading, examples,
// usage, and description length improve a page but remain optional when their
// source evidence is not available; the UI exposes those gaps explicitly.
export const isIndexableRecord = hasCoreEvidence;
