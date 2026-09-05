import type { Dialect, Prefecture, Region, RegionalCultureItem } from "./domain";

export type PrefectureRegionViewModel = {
  id: string;
  name: string;
  description: string;
  dialectCount: number;
  confirmedCount: number;
};

export type PrefectureDialectPreview = {
  id: string;
  word: string;
  reading?: string;
  meaning: string;
  regionName: string;
  verificationLabel: string;
};

export type PrefectureDetailViewModel = {
  id: string;
  name: string;
  area: string;
  summary: string;
  totalDialectCount: number;
  regionCount: number;
  confirmedCount: number;
  needsReviewCount: number;
  sourcedCount: number;
  sourceCoverage: number;
  verificationCoverage: number;
  languageVarieties: Array<{ id: NonNullable<Dialect["languageVariety"]>; label: string }>;
  hasRegions: boolean;
  hasFeaturedWords: boolean;
  hasSourceInformation: boolean;
  searchTarget: string;
  regions: PrefectureRegionViewModel[];
  featuredDialects: PrefectureDialectPreview[];
  cultureItems: RegionalCultureItem[];
};

const isConfirmed = (dialect: Dialect) =>
  ["verified", "reference_confirmed", "community_confirmed", "reviewed"].includes(dialect.verificationStatus);

const verificationLabel = (dialect: Dialect) =>
  isConfirmed(dialect) ? "資料確認" : "確認継続中";

const safeReading = (reading: string) => {
  const value = reading.trim();
  return value && !["unknown", "null", "undefined", "未記録"].includes(value) ? value : undefined;
};

const varietyLabels: Record<NonNullable<Dialect["languageVariety"]>, string> = {
  japanese_dialect: "日本語の方言・地域語",
  ryukyuan_language: "琉球諸語",
  ainu_loanword: "アイヌ語由来語",
  unknown: "分類確認中",
};

export function createPrefectureDetailViewModel(
  prefecture: Prefecture,
  regions: Region[],
  dialects: Dialect[],
  cultureItems: RegionalCultureItem[] = [],
): PrefectureDetailViewModel {
  const regionNames = new Map(regions.map((region) => [region.id, region.name]));
  const ranked = [...dialects].sort((a, b) => {
    const sourcing = Number(Boolean(b.source?.url)) - Number(Boolean(a.source?.url));
    if (sourcing) return sourcing;
    const description = Number(Boolean(b.description.trim())) - Number(Boolean(a.description.trim()));
    return description || a.id.localeCompare(b.id);
  });
  const sourcedCount = dialects.filter((dialect) => Boolean(dialect.source?.url)).length;
  const confirmedCount = dialects.filter(isConfirmed).length;
  const languageVarietyIds = [...new Set(dialects.map((dialect) => dialect.languageVariety ?? "unknown"))].sort();

  return {
    id: prefecture.id,
    name: prefecture.name,
    area: prefecture.area,
    summary: prefecture.summary,
    totalDialectCount: dialects.length,
    regionCount: regions.length,
    confirmedCount,
    needsReviewCount: dialects.filter((dialect) => !isConfirmed(dialect)).length,
    sourcedCount,
    sourceCoverage: dialects.length ? sourcedCount / dialects.length : 0,
    verificationCoverage: dialects.length ? confirmedCount / dialects.length : 0,
    languageVarieties: languageVarietyIds.map((id) => ({ id, label: varietyLabels[id] })),
    hasRegions: regions.length > 0,
    hasFeaturedWords: dialects.length > 0,
    hasSourceInformation: sourcedCount > 0,
    searchTarget: `/search?pref=${prefecture.id}`,
    cultureItems: cultureItems.filter((item) => item.prefectureId === prefecture.id),
    regions: regions.map((region) => {
      const regionDialects = dialects.filter((dialect) => dialect.regionId === region.id);
      return {
        id: region.id,
        name: region.name,
        description: region.description,
        dialectCount: regionDialects.length,
        confirmedCount: regionDialects.filter(isConfirmed).length,
      };
    }),
    featuredDialects: ranked.slice(0, 6).map((dialect) => ({
      id: dialect.id,
      word: dialect.phrase,
      reading: safeReading(dialect.reading),
      meaning: dialect.standardJapanese,
      regionName: regionNames.get(dialect.regionId) ?? "地域確認中",
      verificationLabel: verificationLabel(dialect),
    })),
  };
}
