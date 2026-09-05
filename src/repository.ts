import {
  comparisons,
  conversations,
  dialects,
  prefectures,
  quizzes,
  regions,
} from "./data";
import { extendedConversations, moreDialects } from "./extendedData";
import { nationalDialects, nationalRegions } from "./nationalData";
import { normalizeJapanese } from "./japaneseSearch";
import type {
  Conversation,
  Dialect,
  Page,
  Prefecture,
  Quiz,
  Region,
  RegionalCultureItem,
} from "./domain";
import regionalCultureData from "./data/regional-culture.json";

const nationalPhraseKeys = new Set(
  nationalDialects.map((item) =>
    `${item.prefectureId}|${normalizeJapanese(item.phrase)}`,
  ),
);
const replacedLegacyIds = new Set([
  "d1",
  "d2",
  "d8",
  "d9",
  "d10",
  "d11",
  "d12",
  "d13",
]);
const legacyDialects = [...dialects, ...moreDialects].filter(
  (item) =>
    !replacedLegacyIds.has(item.id) &&
    !nationalPhraseKeys.has(
      `${item.prefectureId}|${normalizeJapanese(item.phrase)}`,
    ),
);
const allDialects = [...legacyDialects, ...nationalDialects];
const allConversations = [...conversations, ...extendedConversations];
const allRegions = [
  ...regions,
  ...nationalRegions.filter(
    (candidate) =>
      !regions.some(
        (existing) =>
          existing.prefectureId === candidate.prefectureId &&
          existing.name === candidate.name,
      ),
  ),
];
const prefectureNames = new Map(
  prefectures.map((item) => [item.id, item.name]),
);
const regionNames = new Map(allRegions.map((item) => [item.id, item.name]));
const searchIndex = new Map(
  allDialects.map((item) => [
    item.id,
    normalizeJapanese(
      [
        item.phrase,
        item.reading,
        item.standardJapanese,
        item.description,
        prefectureNames.get(item.prefectureId) ?? "",
        regionNames.get(item.regionId) ?? "",
        item.municipality ?? "",
        ...item.usageContexts,
        ...item.emotionTags,
      ].join(" "),
    ),
  ]),
);
export type DialectQuery = {
  q?: string;
  prefectureId?: string;
  regionId?: string;
  ageGroup?: string;
  context?: string;
  verificationStatus?: Dialect["verificationStatus"];
  page?: number;
  pageSize?: number;
};
export interface ContentRepository {
  prefectures(): Prefecture[];
  regions(prefectureId?: string): Region[];
  dialects(filters?: DialectQuery): Dialect[];
  dialect(id: string): Dialect | undefined;
  conversations(): Conversation[];
  conversation(id: string): Conversation | undefined;
  comparisons(): typeof comparisons;
  quizzes(): Quiz[];
  cultureItems(filters?: { prefectureId?: string; regionId?: string }): RegionalCultureItem[];
  dialectPage(filters?: DialectQuery): Page<Dialect>;
}
export const repository: ContentRepository = {
  prefectures: () => prefectures,
  regions: (p?: string) => allRegions.filter((r) => !p || r.prefectureId === p),
  dialects: (filters?: DialectQuery) =>
    allDialects.filter(
      (d) =>
        (!filters?.prefectureId || d.prefectureId === filters.prefectureId) &&
        (!filters?.regionId || d.regionId === filters.regionId) &&
        (!filters?.ageGroup || d.ageGroups.includes(filters.ageGroup)) &&
        (!filters?.context ||
          d.usageContexts.some((context) =>
            context.includes(filters.context!),
          )) &&
        (!filters?.verificationStatus ||
          d.verificationStatus === filters.verificationStatus) &&
        (!filters?.q ||
          searchIndex.get(d.id)?.includes(normalizeJapanese(filters.q))),
    ),
  dialect: (id: string) =>
    allDialects.find((d) =>
      d.id ===
      ({
        d1: "jp-40-fukuoka-011",
        d2: "jp-40-fukuoka-016",
      }[id] ?? id),
    ),
  conversations: () => allConversations,
  conversation: (id: string) => allConversations.find((c) => c.id === id),
  comparisons: () => comparisons,
  quizzes: () => quizzes,
  cultureItems: (filters = {}) => (regionalCultureData as RegionalCultureItem[]).filter((item) =>
    (!filters.prefectureId || item.prefectureId === filters.prefectureId) &&
    (!filters.regionId || item.regionId === filters.regionId)),
  dialectPage: (filters = {}) => {
    const items = repository.dialects(filters);
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.max(1, filters.pageSize ?? 12);
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total: items.length,
      page,
      pageSize,
    };
  },
};
