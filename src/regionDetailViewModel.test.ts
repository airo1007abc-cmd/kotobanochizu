import { describe, expect, it } from "vitest";
import { repository } from "./repository";
import { createRegionDetailViewModel } from "./regionDetailViewModel";

const vmFor = (regionId: string) => {
  const region = repository.regions().find((item) => item.id === regionId)!;
  const prefecture = repository.prefectures().find((item) => item.id === region.prefectureId)!;
  const prefectureDialects = repository.dialects({ prefectureId: prefecture.id });
  return createRegionDetailViewModel(region, prefecture, repository.regions(prefecture.id), repository.dialects({ regionId }), prefectureDialects);
};

describe("RegionDetailViewModel", () => {
  it("全地域を例外なく正規化し件数を保持する", () => {
    const regions = repository.regions();
    expect(regions).toHaveLength(195);
    for (const region of regions) {
      const vm = vmFor(region.id);
      expect(vm.id).toBe(region.id);
      expect(vm.dialectCount).toBe(repository.dialects({ regionId: region.id }).length);
      expect(vm.featuredWords.length).toBeLessThanOrEqual(6);
      expect(vm.siblingRegions.filter((item) => item.current)).toHaveLength(1);
    }
  });

  it("代表語選定は入力順に依存しない", () => {
    const region = repository.regions().find((item) => item.name === "中部" && repository.dialects({ regionId: item.id }).length > 100)!;
    const prefecture = repository.prefectures().find((item) => item.id === region.prefectureId)!;
    const siblings = repository.regions(prefecture.id);
    const dialects = repository.dialects({ regionId: region.id });
    const forward = createRegionDetailViewModel(region, prefecture, siblings, dialects, repository.dialects({ prefectureId: prefecture.id }));
    const reverse = createRegionDetailViewModel(region, prefecture, siblings, [...dialects].reverse(), repository.dialects({ prefectureId: prefecture.id }));
    expect(forward.featuredWords.map((item) => item.id)).toEqual(reverse.featuredWords.map((item) => item.id));
  });

  it("0語・1語地域を水増しせず処理する", () => {
    const zero = repository.regions().find((item) => repository.dialects({ regionId: item.id }).length === 0)!;
    const one = repository.regions().find((item) => repository.dialects({ regionId: item.id }).length === 1)!;
    expect(vmFor(zero.id).hasWords).toBe(false);
    expect(vmFor(zero.id).featuredWords).toEqual([]);
    expect(vmFor(one.id).featuredWords).toHaveLength(1);
  });

  it("長い地域名と沖縄・奄美の分類を保持する", () => {
    const long = repository.regions().find((item) => item.name === "島嶼部（周防大島・平郡島など）")!;
    expect(vmFor(long.id).name).toBe(long.name);
    const miyako = repository.regions().find((item) => item.prefectureId === "p47" && item.name === "宮古諸島")!;
    expect(vmFor(miyako.id).languageVarieties.some((item) => item.id === "ryukyuan_language")).toBe(true);
    const amami = repository.regions().find((item) => item.prefectureId === "p46" && item.name === "奄美")!;
    expect(vmFor(amami.id).name).toBe("奄美");
  });
});
