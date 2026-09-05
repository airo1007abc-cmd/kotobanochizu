import { describe, expect, it } from "vitest";
import { createPrefectureDetailViewModel } from "./prefectureDetailViewModel";
import { createRegionDetailViewModel } from "./regionDetailViewModel";
import { repository } from "./repository";

describe("regional culture archive", () => {
  it("keeps all records attributable and linked to valid locations", () => {
    const items = repository.cultureItems();
    const prefectureIds = new Set(repository.prefectures().map((item) => item.id));
    const regionIds = new Set(repository.regions().map((item) => item.id));

    expect(items).toHaveLength(25);
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    expect(
      items.every(
        (item) =>
          prefectureIds.has(item.prefectureId) &&
          (!item.regionId || regionIds.has(item.regionId)) &&
          item.sourceUrl.startsWith("https://") &&
          item.rightsStatus === "official_link" &&
          item.accessType === "external_link" &&
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
    expect(prefectureVm.cultureItems).toHaveLength(10);

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

  it("links exact Nagasaki island records only to their existing region IDs", () => {
    expect(repository.cultureItems({ regionId: "jp-42-region-五島" }).map((item) => item.id)).toContain("culture-nagasaki-goto-karuta");
    expect(repository.cultureItems({ regionId: "jp-42-region-壱岐" }).map((item) => item.id)).toContain("culture-nagasaki-iki-language-history");
    expect(repository.cultureItems({ regionId: "jp-42-region-対馬" }).map((item) => item.id)).toContain("culture-nagasaki-tsushima-kamishibai");
    expect(repository.cultureItems({ regionId: "jp-42-region-県北" }).map((item) => item.id)).not.toContain("culture-nagasaki-cojads");
  });

  it("preserves the Ryukyuan-language classification for Amami material", () => {
    const items = repository.cultureItems({ regionId: "jp-46-region-奄美" });
    expect(items).toHaveLength(2);
    expect(items.every((item) => item.languageVariety === "ryukyuan_language")).toBe(true);
  });

  it("links verified municipal material only to matching existing regions", () => {
    expect(repository.cultureItems({ regionId: "jp-42-region-県央" }).map((item) => item.id)).toContain("culture-nagasaki-isahaya-folktales");
    expect(repository.cultureItems({ regionId: "jp-22-region-中部" }).map((item) => item.id)).toContain("culture-shizuoka-yaizu-hamakotoba");
  });

  it("keeps Aomori Nambu and Shimokita evidence on their exact regions", () => {
    expect(repository.cultureItems({ regionId: "r8" }).map((item) => item.id)).toContain("culture-aomori-nambu-postcard-archive");
    expect(repository.cultureItems({ regionId: "r9" }).map((item) => item.id)).toContain("culture-aomori-shimokita-mutsu-report");
  });

  it("links only sources with an exact current-region correspondence", () => {
    expect(repository.cultureItems({ regionId: "jp-14-region-横浜・川崎" }).map((item) => item.id)).toContain("culture-kanagawa-yokohama-kamishibai");
    expect(repository.cultureItems({ regionId: "r5" }).map((item) => item.id)).toContain("culture-osaka-kawachi-dialect-lecture");
    expect(repository.cultureItems({ regionId: "jp-12-region-北西部" }).map((item) => item.id)).not.toContain("culture-chiba-folktale-audio");
    expect(repository.cultureItems({ prefectureId: "p12" }).map((item) => item.id)).toContain("culture-chiba-folktale-audio");
  });
});
