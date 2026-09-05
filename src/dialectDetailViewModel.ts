import type { Dialect, SourceMetadata } from "./domain";

const missingTokens = new Set(["unknown", "null", "undefined", "未記録"]);
const scopeLabels: Record<string, string> = {
  phrase: "語形",
  reading: "読み",
  meaning: "意味",
  region: "地域",
  example: "例文",
  usage: "用法",
  history: "来歴",
};

export type DialectDetailExample = { dialect: string; standard: string };
export type DialectDetailSource = {
  title?: string;
  organization?: string;
  url?: string;
  checkedAt?: string;
  recordingYear?: number;
};
export type DialectDetailViewModel = {
  id: string;
  word: string;
  reading?: string;
  meanings: string[];
  description?: string;
  nuance?: string;
  examples: DialectDetailExample[];
  prefecture: { id: string; name: string };
  primaryRegion: { id: string; name: string };
  locationBadges: string[];
  locationSummary: string;
  sources: DialectDetailSource[];
  verifiedItems: string[];
  pendingItems: string[];
  verificationLabel: string;
  isResearchPending: boolean;
  updatedAt?: string;
};

type FutureDialectFields = {
  nuance?: unknown;
  meanings?: unknown;
  examples?: unknown;
  regionIds?: unknown;
};

const optionalText = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized && !missingTokens.has(normalized.toLowerCase()) ? normalized : undefined;
};

const verificationLabel = (status: Dialect["verificationStatus"]) => status === "needs_review"
  ? "要確認・資料確認中"
  : status === "community_confirmed" || status === "community"
    ? "地域確認済み"
    : status === "demo" || status === "demo_candidate"
      ? "確認待ち候補"
      : "資料確認済み";

const normalizeExamples = (dialect: Dialect & FutureDialectFields): DialectDetailExample[] => {
  const candidates: unknown[] = Array.isArray(dialect.examples) ? dialect.examples : [];
  if (dialect.exampleDialect || dialect.exampleStandard) {
    candidates.unshift({ dialect: dialect.exampleDialect, standard: dialect.exampleStandard });
  }
  const seen = new Set<string>();
  return candidates.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const record = candidate as Record<string, unknown>;
    const dialectText = optionalText(record.dialect ?? record.exampleDialect);
    const standardText = optionalText(record.standard ?? record.exampleStandard);
    if (!dialectText || !standardText) return [];
    const key = `${dialectText}\u0000${standardText}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ dialect: dialectText, standard: standardText }];
  });
};

const normalizeSources = (dialect: Dialect): DialectDetailSource[] => {
  const sources = [dialect.source, ...(dialect.additionalSources ?? [])].filter(
    (source): source is SourceMetadata => Boolean(source),
  );
  return sources.flatMap((source, index) => {
    const normalized = {
      title: optionalText(source.title),
      organization: optionalText(source.organization),
      url: optionalText(source.url),
      checkedAt: optionalText(source.checkedAt),
      recordingYear: index === 0 ? dialect.recordingYear : undefined,
    };
    return normalized.title || normalized.organization || normalized.url ? [normalized] : [];
  });
};

const normalizeMeanings = (dialect: Dialect & FutureDialectFields): string[] => {
  const candidates = [
    optionalText(dialect.standardJapanese),
    ...(Array.isArray(dialect.meanings) ? dialect.meanings.map(optionalText) : []),
  ].filter((item): item is string => Boolean(item));
  return [...new Set(candidates)];
};

export function createDialectDetailViewModel(
  rawDialect: Dialect,
  lookups: {
    prefectureName: (id: string) => string | undefined;
    regionName: (id: string) => string | undefined;
  },
): DialectDetailViewModel {
  const dialect = rawDialect as Dialect & FutureDialectFields;
  const prefectureName = optionalText(lookups.prefectureName(dialect.prefectureId)) ?? "地域確認中";
  const primaryRegionName = optionalText(lookups.regionName(dialect.regionId)) ?? "地域確認中";
  const municipalityLocations = (optionalText(dialect.municipality) ?? "")
    .split(/[;；]/)
    .map(optionalText)
    .filter((item): item is string => Boolean(item));
  const futureRegionLocations = Array.isArray(dialect.regionIds)
    ? dialect.regionIds.map((id) => typeof id === "string" ? optionalText(lookups.regionName(id)) : undefined)
      .filter((item): item is string => Boolean(item) && item !== primaryRegionName)
    : [];
  const locationBadges = [...new Set([...municipalityLocations, ...futureRegionLocations])];
  const examples = normalizeExamples(dialect);
  const evidence = [...new Set([
    ...(dialect.source?.evidenceScopes ?? []),
    ...(dialect.additionalSources ?? []).flatMap((source) => source.evidenceScopes ?? []),
  ])];
  const verifiedItems = evidence.map((item) => scopeLabels[item] ?? item);
  const pendingItems = [
    (!dialect.ageGroups.length || dialect.ageGroups.some((item) => !optionalText(item))) && "世代差",
    !optionalText(dialect.usageFrequency) && "使用頻度",
    !dialect.usageContexts.some(optionalText) && "使用場面",
    examples.length === 0 && "自然な用例",
  ].filter((item): item is string => Boolean(item));
  const meanings = normalizeMeanings(dialect);

  return {
    id: dialect.id,
    word: optionalText(dialect.phrase) ?? "表記確認中",
    reading: optionalText(dialect.reading),
    meanings,
    description: optionalText(dialect.description),
    nuance: optionalText(dialect.nuance),
    examples,
    prefecture: { id: dialect.prefectureId, name: prefectureName },
    primaryRegion: { id: dialect.regionId, name: primaryRegionName },
    locationBadges,
    locationSummary: [prefectureName, primaryRegionName, ...locationBadges].join("・"),
    sources: normalizeSources(dialect),
    verifiedItems,
    pendingItems,
    verificationLabel: verificationLabel(dialect.verificationStatus),
    isResearchPending: dialect.verificationStatus === "needs_review" || pendingItems.length > 0,
    updatedAt: optionalText(dialect.updatedAt),
  };
}
