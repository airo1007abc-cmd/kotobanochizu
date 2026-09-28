import { describe, expect, it } from "vitest";
import type { Dialect } from "./domain";
import { repository } from "./repository";
import { createRecordedPlaceIndex, recordedPlaceFor } from "./recordedPlaces";

const source = { type: "official_reference" as const, title: "資料", url: "https://example.org", checkedAt: "2026-09-01", evidenceScopes: ["region" as const] };
const base: Dialect = {
  id: "one", phrase: "語", reading: "", standardJapanese: "意味", description: "", exampleDialect: "", exampleStandard: "",
  prefectureId: "p1", regionId: "r1", municipality: "旧地名", ageGroups: [], usageContexts: [], emotionTags: [],
  usageFrequency: "unknown", verificationStatus: "needs_review", sourceType: "demo", source,
  createdAt: "2026-01-01", updatedAt: "2026-01-01", reactions: { use: 0, heard: 0, new: 0 },
};

describe("recorded place index", () => {
  it("preserves source place wording, deduplicates IDs, and does not invent a municipality", () => {
    const prefs = repository.prefectures().slice(0, 1);
    const index = createRecordedPlaceIndex([
      base, base,
      { ...base, id: "two", municipality: undefined, locality: "資料の小字" },
      { ...base, id: "three", municipality: undefined, locality: undefined, evidenceRegion: "県内" },
      { ...base, id: "unverified", source: { ...source, evidenceScopes: ["meaning"] } },
    ], prefs)[0];
    expect(index.count).toBe(3);
    expect(index.places.map((place) => place.name)).toEqual(["旧地名", "資料の小字"]);
    expect(index.unspecified.map((record) => record.id)).toEqual(["three"]);
    expect(recordedPlaceFor({ ...base, source: undefined })).toBeNull();
  });

  it("counts every eligible published record once in its own prefecture", () => {
    const index = createRecordedPlaceIndex(repository.dialects(), repository.prefectures());
    expect(index).toHaveLength(47);
    for (const bucket of index) {
      const ids = [...bucket.places.flatMap((place) => place.records), ...bucket.unspecified].map((record) => record.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBe(bucket.count);
      expect(ids.every((id) => repository.dialect(id)?.prefectureId === bucket.prefecture.id)).toBe(true);
    }
  });
});
