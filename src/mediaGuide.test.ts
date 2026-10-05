import { describe, expect, it } from "vitest";
import mediaGuides from "./data/media-guides.json";
import { repository } from "./repository";
import { getPageMetadata, isIndexableDialectRoute } from "./seo";

describe("media guide integrity", () => {
  it("keeps guide identities and source URLs unique", () => {
    expect(new Set(mediaGuides.map((guide) => guide.slug)).size).toBe(
      mediaGuides.length,
    );

    for (const guide of mediaGuides) {
      expect(guide.slug.trim()).not.toBe("");
      expect(guide.title.trim()).not.toBe("");
      expect(guide.description.trim()).not.toBe("");
      expect(guide.searchIntent.trim()).not.toBe("");
      expect(guide.answer.trim()).not.toBe("");
      expect(guide.workEvidence.trim()).not.toBe("");
      expect(guide.regionHeading.trim()).not.toBe("");
      expect(guide.regionEvidence.trim()).not.toBe("");
      expect(guide.caution.trim()).not.toBe("");
      expect(guide.relatedHeading.trim()).not.toBe("");
      expect(guide.relatedNote.trim()).not.toBe("");
      expect(["indexable", "review_required", "noindex"]).toContain(
        guide.indexStatus,
      );
      expect(guide.sourceCheckedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const sourceUrls = guide.sources.map((source) => source.url);
      expect(guide.sources.length).toBeGreaterThanOrEqual(2);
      expect(new Set(sourceUrls).size).toBe(sourceUrls.length);
      for (const source of guide.sources) {
        expect(source.label.trim()).not.toBe("");
        expect(source.scope.trim()).not.toBe("");
        expect(source.url).toMatch(/^https:\/\//);
      }
    }
  });

  it("links only to distinct, existing dialect records", () => {
    for (const guide of mediaGuides) {
      expect(guide.relatedDialectIds.length).toBeGreaterThan(0);
      expect(new Set(guide.relatedDialectIds).size).toBe(
        guide.relatedDialectIds.length,
      );
      for (const id of guide.relatedDialectIds)
        expect(repository.dialect(id), `${guide.slug} -> ${id}`).toBeDefined();
    }
  });

  it("applies the published media-guide indexability gate", () => {
    for (const guide of mediaGuides) {
      const expected =
        guide.indexStatus === "indexable" &&
        guide.sources.length >= 2 &&
        guide.relatedDialectIds.every((id) =>
          isIndexableDialectRoute(repository.dialect(id)),
        );
      expect(getPageMetadata(`/guides/media/${guide.slug}`).indexable).toBe(
        expected,
      );
    }
  });

  it("separates the Conan fan phrase from documented Osaka usage", () => {
    const guide = mediaGuides.find(
      (item) => item.slug === "detective-conan-seyakate-kudo",
    );
    expect(guide).toBeDefined();
    expect(guide?.answer).toContain("ファンが親しみを込めて作ったワード");
    expect(guide?.workEvidence).toContain("原作の特定場面");
    expect(guide?.regionEvidence).toContain("大阪府警察");
    expect(guide?.regionEvidence).toContain("表記は「せやかて」ではない");
    expect(guide?.relatedDialectIds).toEqual(["jp-27-osaka-059"]);
    expect(
      isIndexableDialectRoute(repository.dialect("jp-27-osaka-059")),
    ).toBe(true);
    expect(
      getPageMetadata(
        "/guides/media/detective-conan-seyakate-kudo",
      ).indexable,
    ).toBe(true);
  });
});
