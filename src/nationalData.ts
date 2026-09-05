import type { Dialect, Region } from "./domain";
import { prefectures, regions as legacyRegions } from "./data";
import regionCatalog from "./data/regions.json";

type RawDialect = {
  id: string;
  slug: string;
  phrase: string;
  reading: string;
  standardJapanese: string;
  description: string;
  exampleDialect: string;
  exampleStandard: string;
  prefectureCode: number;
  prefectureName: string;
  regionName: string;
  municipality: string | null;
  ageGroups: string[];
  usageContexts: string[];
  emotionTags: string[];
  usageFrequency: Dialect["usageFrequency"];
  verificationStatus: Dialect["verificationStatus"];
  sourceType: NonNullable<Dialect["source"]>["type"];
  sourceNote: string;
  sourceTitle?: string;
  sourceOrganization?: string;
  sourceUrl?: string;
  sourceCheckedAt?: string;
  sourcePublicationYear?: string;
  sourceTier?: 1 | 2 | 3 | 4;
  sourceExactFormMatch?: "exact" | "variant" | "uncertain";
  evidenceScopes?: NonNullable<Dialect["source"]>["evidenceScopes"];
  additionalSources?: NonNullable<Dialect["additionalSources"]>;
  confidence: NonNullable<Dialect["confidence"]>;
  recordingYear: number | null;
  audioUrl: string | null;
  videoUrl: string | null;
  needsAudio: boolean;
  audioPriority: 1 | 2 | 3;
  languageVariety: NonNullable<Dialect["languageVariety"]>;
  createdAt?: string;
  updatedAt?: string;
};
const modules = import.meta.glob("./data/dialects/*.json", {
  eager: true,
  import: "default",
}) as Record<string, RawDialect[]>;
const rawDialects = Object.values(modules).flat();
const codeToPrefecture = new Map(prefectures.map((item) => [item.code, item]));
const regionIdFor = (code: number, name: string) => {
  const prefecture = codeToPrefecture.get(code);
  const legacy = prefecture
    ? legacyRegions.find(
        (item) => item.prefectureId === prefecture.id && item.name === name,
      )
    : undefined;
  return legacy?.id ?? `jp-${String(code).padStart(2, "0")}-region-${name}`;
};

export const nationalRegions: Region[] = Object.entries(regionCatalog).flatMap(
  ([prefectureName, names]) => {
    const prefecture = prefectures.find((item) => item.name === prefectureName);
    if (!prefecture) return [];
    return names.map((name) => ({
      id: regionIdFor(prefecture.code, name),
      prefectureId: prefecture.id,
      name,
      description: `${prefectureName}を探しやすくするための実用的な地域区分です。言語学的境界を断定するものではありません。`,
    }));
  },
);

export const nationalDialects: Dialect[] = rawDialects.flatMap((raw) => {
  const prefecture = codeToPrefecture.get(raw.prefectureCode);
  if (!prefecture || prefecture.name !== raw.prefectureName) return [];
  return [
    {
      id: raw.id,
      slug: raw.slug,
      phrase: raw.phrase,
      reading: raw.reading,
      standardJapanese: raw.standardJapanese,
      description: raw.description,
      exampleDialect: raw.exampleDialect,
      exampleStandard: raw.exampleStandard,
      prefectureId: prefecture.id,
      regionId: regionIdFor(raw.prefectureCode, raw.regionName),
      municipality: raw.municipality ?? undefined,
      ageGroups: raw.ageGroups,
      usageContexts: raw.usageContexts,
      emotionTags: raw.emotionTags,
      usageFrequency: raw.usageFrequency,
      verificationStatus: raw.verificationStatus,
      sourceType: "demo",
      source: {
        type: raw.sourceType,
        note: raw.sourceNote,
        title: raw.sourceTitle,
        organization: raw.sourceOrganization,
        url: raw.sourceUrl,
        checkedAt: raw.sourceCheckedAt,
        publicationYear: raw.sourcePublicationYear,
        sourceTier: raw.sourceTier,
        exactFormMatch: raw.sourceExactFormMatch,
        evidenceScopes: raw.evidenceScopes,
      },
      additionalSources: raw.additionalSources,
      confidence: raw.confidence,
      recordingYear: raw.recordingYear ?? undefined,
      audioUrl: raw.audioUrl ?? undefined,
      videoUrl: raw.videoUrl ?? undefined,
      needsAudio: raw.needsAudio,
      audioPriority: raw.audioPriority,
      languageVariety: raw.languageVariety,
      createdAt: raw.createdAt ?? "2026-08-25",
      updatedAt: raw.updatedAt ?? "2026-08-25",
      reactions: { use: 0, heard: 0, new: 0 },
    },
  ];
});
