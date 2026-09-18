import { describe, it, expect } from "vitest";
import { dialectMatchesContext, dialectSearchText, repository } from "./repository";
import type { Dialect } from "./domain";
import { normalizeJapanese } from "./japaneseSearch";
describe("repository", () => {
  it("has all 47 prefectures", () =>
    expect(repository.prefectures()).toHaveLength(47));
  it("searches phrase and standard Japanese", () => {
    expect(
      repository
        .dialects({ q: "なおす" })
        .some((dialect) => dialect.phrase.includes("なおす")),
    ).toBe(true);
    expect(repository.dialects({ q: "かわいい" })[0]?.phrase).toBe("めんこい");
  });
  it("uses reading and usage in discovery only with matching evidence", () => {
    const current = repository.dialects().find((item) => item.source)!;
    const withEvidence = {
      ...current,
      reading: "しょうこけんさよみ",
      usageContexts: ["証拠付き検索場面"],
      source: {
        ...current.source!,
        evidenceScopes: ["phrase", "meaning", "region", "reading", "usage"],
      },
      additionalSources: [],
    } as Dialect;
    const withoutEvidence = {
      ...withEvidence,
      source: { ...withEvidence.source!, evidenceScopes: ["phrase", "meaning", "region"] },
    } as Dialect;
    expect(dialectSearchText(withEvidence)).toContain(normalizeJapanese("しょうこけんさよみ"));
    expect(dialectSearchText(withoutEvidence)).not.toContain(normalizeJapanese("しょうこけんさよみ"));
    expect(dialectMatchesContext(withEvidence, "証拠付き検索場面")).toBe(true);
    expect(dialectMatchesContext(withoutEvidence, "証拠付き検索場面")).toBe(false);
  });
  it("filters by region", () => {
    const region = repository.regions().find((r) => r.name === "津軽")!;
    expect(
      repository
        .dialects({ regionId: region.id })
        .every((d) => d.regionId === region.id),
    ).toBe(true);
  });
  it("does not expose an unverified legacy context through combined facets", () => {
    const results = repository.dialects({
      prefectureId: repository.prefectures().find((p) => p.name === "青森県")!
        .id,
      ageGroup: "全年代",
      context: "日常",
      verificationStatus: "demo",
    });
    expect(results).toEqual([]);
  });
  it("has at least one expression and two regions for every prefecture", () => {
    for (const prefecture of repository.prefectures()) {
      expect(
        repository.dialects({ prefectureId: prefecture.id }).length,
        prefecture.name,
      ).toBeGreaterThan(0);
      expect(
        repository.regions(prefecture.id).length,
        prefecture.name,
      ).toBeGreaterThanOrEqual(2);
    }
  });
  it("has no duplicate dialect ids and no orphan regions", () => {
    const dialects = repository.dialects();
    expect(new Set(dialects.map((item) => item.id)).size).toBe(dialects.length);
    const regionIds = new Set(repository.regions().map((item) => item.id));
    expect(dialects.every((item) => regionIds.has(item.regionId))).toBe(true);
  });
});
