import { describe, it, expect } from "vitest";
import { repository } from "./repository";
describe("repository", () => {
  it("has all 47 prefectures", () =>
    expect(repository.prefectures()).toHaveLength(47));
  it("searches phrase and standard Japanese", () => {
    expect(repository.dialects({ q: "なおす" })[0]?.standardJapanese).toContain(
      "片づけ",
    );
    expect(repository.dialects({ q: "かわいい" })[0]?.phrase).toBe("めんこい");
  });
  it("filters by region", () => {
    const region = repository.regions().find((r) => r.name === "津軽")!;
    expect(
      repository
        .dialects({ regionId: region.id })
        .every((d) => d.regionId === region.id),
    ).toBe(true);
  });
  it("combines archive facets", () => {
    const results = repository.dialects({
      prefectureId: repository.prefectures().find((p) => p.name === "青森県")!
        .id,
      ageGroup: "全年代",
      context: "日常",
      verificationStatus: "demo",
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.verificationStatus === "demo")).toBe(
      true,
    );
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
