import { describe, expect, it } from "vitest";
import { createPrefectureDetailViewModel } from "./prefectureDetailViewModel";
import { createRegionDetailViewModel } from "./regionDetailViewModel";
import { repository } from "./repository";

describe("regional culture archive", () => {
  it("keeps all records attributable and linked to valid locations", () => {
    const items = repository.cultureItems();
    const prefectureIds = new Set(repository.prefectures().map((item) => item.id));
    const regionIds = new Set(repository.regions().map((item) => item.id));

    expect(items).toHaveLength(14);
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    expect(
      items.every(
        (item) =>
          prefectureIds.has(item.prefectureId) &&
          (!item.regionId || regionIds.has(item.regionId)) &&
          item.sourceUrl.startsWith("https://") &&
          item.rightsStatus === "official_link" &&
          Boolean(item.sourceOrganization && item.rightsNote),
      ),
    ).toBe(true);
  });

  it("shows Nagasaki-wide material on the prefecture and only exact material in a region", () => {
    const prefecture = repository.prefectures().find((item) => item.id === "p42")!;
    const regions = repository.regions(prefecture.id);
    const dialects = repository.dialects({ prefectureId: prefecture.id });
    const prefectureVm = createPrefectureDetailViewModel(
      prefecture,
      regions,
      dialects,
      repository.cultureItems({ prefectureId: prefecture.id }),
    );
    expect(prefectureVm.cultureItems).toHaveLength(5);

    const region = regions.find((item) => item.id === "jp-42-region-県南")!;
    const regionVm = createRegionDetailViewModel(
      region,
      prefecture,
      regions,
      repository.dialects({ regionId: region.id }),
      dialects,
      repository.cultureItems({ regionId: region.id }),
    );
    expect(regionVm.cultureItems.map((item) => item.id)).toEqual([
      "culture-nagasaki-denderaryuba",
      "culture-nagasaki-songs",
    ]);
  });

  it("preserves the Ryukyuan-language classification for Amami material", () => {
    const items = repository.cultureItems({ regionId: "jp-46-region-奄美" });
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.languageVariety === "ryukyuan_language")).toBe(true);
  });
});
