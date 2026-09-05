import type { Dialect, Prefecture, Region, RegionalCultureItem } from "./domain";

export type RegionDetailViewModel = {
  id: string;
  name: string;
  description?: string;
  prefecture: { id: string; name: string; area: string };
  dialectCount: number;
  sourcedCount: number;
  confirmedCount: number;
  needsReviewCount: number;
  languageVarieties: Array<{ id: NonNullable<Dialect["languageVariety"]>; label: string }>;
  municipalities: string[];
  featuredWords: Array<{ id: string; word: string; reading?: string; meaning: string; municipality?: string; verificationLabel: string }>;
  siblingRegions: Array<{ id: string; name: string; dialectCount: number; current: boolean }>;
  hasWords: boolean;
  hasSources: boolean;
  hasLocations: boolean;
  searchTarget: string;
  cultureItems: RegionalCultureItem[];
};

const confirmed = (item: Dialect) => ["verified", "reference_confirmed", "community_confirmed", "reviewed"].includes(item.verificationStatus);
const text = (value?: string) => {
  const safe = value?.trim();
  return safe && !["unknown", "undefined", "null", "未記録"].includes(safe) ? safe : undefined;
};
const labels: Record<NonNullable<Dialect["languageVariety"]>, string> = {
  japanese_dialect: "日本語の方言・地域語", ryukyuan_language: "琉球諸語", ainu_loanword: "アイヌ語由来語", unknown: "分類確認中",
};

export function createRegionDetailViewModel(region: Region, prefecture: Prefecture, siblings: Region[], dialects: Dialect[], prefectureDialects: Dialect[] = dialects, cultureItems: RegionalCultureItem[] = []): RegionDetailViewModel {
  const sourcedCount = dialects.filter((item) => Boolean(item.source?.url) || Boolean(item.additionalSources?.some((source) => source.url))).length;
  const confirmedCount = dialects.filter(confirmed).length;
  const varieties = [...new Set(dialects.map((item) => item.languageVariety ?? "unknown"))].sort();
  const municipalities = [...new Set(dialects.map((item) => text(item.municipality)).filter((item): item is string => Boolean(item)))].sort((a, b) => a.localeCompare(b, "ja"));
  const ranked = [...dialects].sort((a, b) => {
    const source = Number(Boolean(b.source?.url)) - Number(Boolean(a.source?.url));
    const verification = Number(confirmed(b)) - Number(confirmed(a));
    const reading = Number(Boolean(text(b.reading))) - Number(Boolean(text(a.reading)));
    const description = Number(Boolean(text(b.description))) - Number(Boolean(text(a.description)));
    return source || verification || reading || description || a.id.localeCompare(b.id);
  });
  return {
    id: region.id, name: region.name, description: text(region.description),
    prefecture: { id: prefecture.id, name: prefecture.name, area: prefecture.area },
    dialectCount: dialects.length, sourcedCount, confirmedCount, needsReviewCount: dialects.length - confirmedCount,
    languageVarieties: varieties.map((id) => ({ id, label: labels[id] })), municipalities,
    featuredWords: ranked.slice(0, 6).map((item) => ({ id: item.id, word: item.phrase, reading: text(item.reading), meaning: item.standardJapanese, municipality: text(item.municipality), verificationLabel: confirmed(item) ? "参照確認" : "確認継続中" })),
    siblingRegions: siblings.map((item) => ({ id: item.id, name: item.name, dialectCount: prefectureDialects.filter((dialect) => dialect.regionId === item.id).length, current: item.id === region.id })),
    hasWords: dialects.length > 0, hasSources: sourcedCount > 0, hasLocations: municipalities.length > 0,
    searchTarget: `/search?pref=${prefecture.id}&region=${encodeURIComponent(region.id)}`,
    cultureItems: cultureItems.filter((item) => item.regionId === region.id),
  };
}
