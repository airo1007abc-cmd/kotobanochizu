import contextGuides from "./data/context-guides.json";
import { hasEvidenceScope } from "./evidencePolicy.mjs";
import { repository } from "./repository";
import { allPageMetadata } from "./seo";

// Curated entrances point to existing guides, never to an unverified keyword search.
const sceneCandidates = [
  {
    slug: "yaizu-family-home-utterances",
    title: "家族のひととき",
    detail: "家の中で交わすことば",
    place: "静岡・焼津",
    illustration: "home",
  },
  {
    slug: "yaizu-food-table-utterances",
    title: "食卓を囲んで",
    detail: "味わいと、おなかの話",
    place: "静岡・焼津",
    illustration: "food",
  },
  {
    slug: "shunan-home-visit-utterances",
    title: "誰かを訪ねて",
    detail: "玄関から座敷まで",
    place: "山口・周南",
    illustration: "visit",
  },
  {
    slug: "sano-winter-utterances",
    title: "冬のある日",
    detail: "寒さ、風、雪のことば",
    place: "栃木・佐野",
    illustration: "winter",
  },
  {
    slug: "yaizu-children-play-utterances",
    title: "遊びの時間",
    detail: "めんこに、じゃんけん",
    place: "静岡・焼津",
    illustration: "play",
  },
  {
    slug: "yaizu-gifts-relatives-utterances",
    title: "贈る気持ち",
    detail: "お礼と親戚づきあい",
    place: "静岡・焼津",
    illustration: "gift",
  },
] as const;

export type SceneIllustration =
  (typeof sceneCandidates)[number]["illustration"];
const availablePaths = new Set(
  allPageMetadata.filter((page) => page.indexable).map((page) => page.path),
);

export const homeScenes = sceneCandidates.flatMap((scene) => {
  const path = `/stories/${scene.slug}`;
  const guide = contextGuides.find((item) => item.slug === scene.slug);
  if (!guide || !availablePaths.has(path) || !guide.dialectIds.length)
    return [];
  const records = guide.dialectIds.map((id) => repository.dialect(id));
  if (
    !records.every(
      (record) =>
        record &&
        hasEvidenceScope(record, "example") &&
        record.exampleDialect &&
        record.exampleStandard,
    )
  )
    return [];
  return [{ ...scene, path, count: records.length }];
});
