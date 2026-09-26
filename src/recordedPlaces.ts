import type { Dialect, Prefecture } from "./domain";
import { hasEvidenceScope } from "./evidencePolicy.mjs";

export const recordedPlaceFor = (dialect: Dialect) => {
  if (!hasEvidenceScope(dialect, "region")) return null;
  // Keep source wording intact. A locality without a municipality is still a
  // named place, but must never be silently converted to a present-day city.
  return dialect.municipality?.trim() || dialect.locality?.trim() || null;
};

export type RecordedPlace = { name: string; records: Dialect[] };
export type RecordedPrefecture = {
  prefecture: Prefecture;
  places: RecordedPlace[];
  unspecified: Dialect[];
  count: number;
};

export function createRecordedPlaceIndex(dialects: Dialect[], prefectures: Prefecture[]): RecordedPrefecture[] {
  const buckets = new Map(prefectures.map((prefecture) => [prefecture.id, {
    prefecture, places: new Map<string, Dialect[]>(), unspecified: [] as Dialect[], seen: new Set<string>(),
  }]));
  for (const dialect of dialects) {
    const bucket = buckets.get(dialect.prefectureId);
    if (!bucket || bucket.seen.has(dialect.id) || !hasEvidenceScope(dialect, "region")) continue;
    bucket.seen.add(dialect.id);
    const place = recordedPlaceFor(dialect);
    if (place) {
      if (!bucket.places.has(place)) bucket.places.set(place, []);
      bucket.places.get(place)!.push(dialect);
    } else {
      bucket.unspecified.push(dialect);
    }
  }
  return [...buckets.values()].map(({ prefecture, places, unspecified, seen }) => ({
    prefecture,
    places: [...places].map(([name, records]) => ({ name, records })).sort((a, b) =>
      b.records.length - a.records.length || a.name.localeCompare(b.name, "ja")),
    unspecified,
    count: seen.size,
  }));
}
