import { describe, expect, it } from "vitest";
import { repository } from "./repository";
import { createPrefectureDetailViewModel } from "./prefectureDetailViewModel";
import { shouldUsePrefectureDetailV2 } from "./prefectureDetailVersion";

describe("PrefectureDetailViewModel", () => {
  it("佐賀県の実データを地域別に正規化する", () => {
    const prefecture = repository.prefectures().find((item) => item.name === "佐賀県");
    expect(prefecture).toBeDefined();
    const regions = repository.regions(prefecture!.id);
    const dialects = repository.dialects({ prefectureId: prefecture!.id });
    const vm = createPrefectureDetailViewModel(prefecture!, regions, dialects);

    expect(vm.totalDialectCount).toBe(47);
    expect(vm.regionCount).toBe(4);
    expect(vm.confirmedCount).toBe(46);
    expect(vm.sourcedCount).toBe(47);
    expect(vm.regions.map((region) => [region.name, region.dialectCount])).toEqual([
      ["佐賀平野", 15],
      ["唐津・東松浦", 10],
      ["伊万里・西松浦", 10],
      ["杵島・藤津", 12],
    ]);
    expect(vm.featuredDialects).toHaveLength(6);
    expect(vm.featuredDialects[0].word).toBe("がばい");
  });

  it("欠損読みをUIへ露出しない", () => {
    const prefecture = repository.prefectures().find((item) => item.name === "佐賀県")!;
    const dialects = repository.dialects({ prefectureId: prefecture.id });
    const sparse = { ...dialects[0], reading: "unknown" };
    const vm = createPrefectureDetailViewModel(prefecture, repository.regions(prefecture.id), [sparse]);
    expect(vm.featuredDialects[0].reading).toBeUndefined();
  });

  it("全47都道府県を例外なく正規化し、代表語を6件以内に制限する", () => {
    const prefectures = repository.prefectures();
    expect(prefectures).toHaveLength(47);

    for (const prefecture of prefectures) {
      const regions = repository.regions(prefecture.id);
      const dialects = repository.dialects({ prefectureId: prefecture.id });
      const vm = createPrefectureDetailViewModel(prefecture, regions, dialects);
      expect(vm.id).toBe(prefecture.id);
      expect(vm.totalDialectCount).toBe(dialects.length);
      expect(vm.regionCount).toBe(regions.length);
      expect(vm.featuredDialects.length).toBeLessThanOrEqual(6);
      expect(vm.regions.reduce((sum, region) => sum + region.dialectCount, 0)).toBe(dialects.length);
    }
  });

  it("代表語選定は入力順に依存せず決定的である", () => {
    const prefecture = repository.prefectures().find((item) => item.name === "沖縄県")!;
    const regions = repository.regions(prefecture.id);
    const dialects = repository.dialects({ prefectureId: prefecture.id });
    const forward = createPrefectureDetailViewModel(prefecture, regions, dialects);
    const reversed = createPrefectureDetailViewModel(prefecture, regions, [...dialects].reverse());
    expect(forward.featuredDialects.map((item) => item.id)).toEqual(
      reversed.featuredDialects.map((item) => item.id),
    );
    expect(forward.languageVarieties.some((item) => item.id === "ryukyuan_language")).toBe(true);
  });

  it("全都道府県の通常URLをV2対象にする", () => {
    const prefectures = repository.prefectures();
    expect(prefectures.filter((item) => shouldUsePrefectureDetailV2(item.id))).toHaveLength(47);
  });

  it("地域配列が空でも空セクション用の安全なViewModelを返す", () => {
    const prefecture = repository.prefectures()[0];
    const dialects = repository.dialects({ prefectureId: prefecture.id });
    const vm = createPrefectureDetailViewModel(prefecture, [], dialects);
    expect(vm.hasRegions).toBe(false);
    expect(vm.regions).toEqual([]);
    expect(vm.featuredDialects.every((item) => item.regionName === "地域確認中")).toBe(true);
  });

  it("長い地域名と出典統計を加工せず保持する", () => {
    const prefecture = repository.prefectures().find((item) => item.name === "山口県")!;
    const regions = repository.regions(prefecture.id);
    const dialects = repository.dialects({ prefectureId: prefecture.id });
    const vm = createPrefectureDetailViewModel(prefecture, regions, dialects);
    expect(vm.regions.map((item) => item.name)).toContain("島嶼部（周防大島・平郡島など）");
    expect(vm.sourcedCount).toBe(dialects.filter((item) => Boolean(item.source?.url)).length);
  });
});
