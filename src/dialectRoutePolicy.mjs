import { isIndexableRecord } from "./evidencePolicy.mjs";

const identityPart = (value) =>
  typeof value === "string" ? value.normalize("NFKC").trim() : "";

export const dialectIdentityKey = (record) =>
  [
    record.phrase,
    record.standardJapanese,
    record.prefectureId,
    record.municipality,
    record.locality,
    record.evidenceRegion,
    record.source?.url ?? record.sourceUrl,
    record.source?.page ?? record.sourcePage,
  ]
    .map(identityPart)
    .join("|");

export const createDialectRoutePolicy = (records) => {
  const byIdentity = new Map();
  for (const record of records) {
    const identity = dialectIdentityKey(record);
    byIdentity.set(identity, [...(byIdentity.get(identity) ?? []), record]);
  }
  const identityCollisions = [...byIdentity.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([identity, group]) => ({ identity, ids: group.map((record) => record.id) }));
  const collisionIds = new Set(identityCollisions.flatMap(({ ids }) => ids));

  return {
    identityCollisions,
    collisionIds,
    isRouteIndexable: (record) =>
      Boolean(record && isIndexableRecord(record) && !collisionIds.has(record.id)),
  };
};
