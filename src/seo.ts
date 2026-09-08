import { repository } from "./repository";
import type { Dialect } from "./domain";
import { hasCoreEvidence, isIndexableRecord } from "./evidencePolicy.mjs";
export { hasCoreEvidence } from "./evidencePolicy.mjs";
import meanings from "./data/meaning-comparisons.json";
import guides from "./data/region-guides.json";
import cultures from "./data/culture-guides.json";
import stories from "./data/context-guides.json";

export type Crumb = { name: string; path: string };
export type PageMetadata = {
  path: string;
  title: string;
  description: string;
  indexable: boolean;
  breadcrumbs: Crumb[];
};
export const redirects: Record<string, string> = {
  "/dialects/d1": "/dialects/jp-40-fukuoka-011",
  "/dialects/d2": "/dialects/jp-40-fukuoka-016",
};
const prefs = repository.prefectures();
const regions = repository.regions();
const words = repository.dialects();
const prefName = (id: string) => prefs.find((p) => p.id === id)?.name ?? "";
const regionName = (id: string) => regions.find((r) => r.id === id)?.name ?? "";
const home: Crumb = { name: "ホーム", path: "/" };
const places: Crumb = { name: "地域を探す", path: "/prefectures" };
export const isConfirmed = (d: Dialect) =>
  ["verified", "reference_confirmed", "community_confirmed"].includes(
    d.verificationStatus,
  );
export const isIndexableDialect = isIndexableRecord;
const metadata = new Map<string, PageMetadata>();
function add(
  path: string,
  title: string,
  description: string,
  indexable = false,
  parents: Crumb[] = [home],
  label = title,
) {
  metadata.set(path, {
    path,
    title:
      title.includes("｜ことばの地図") || path === "/"
        ? title
        : `${title}｜ことばの地図`,
    description,
    indexable,
    breadcrumbs: path === "/" ? [home] : [...parents, { name: label, path }],
  });
}
add(
  "/",
  "ことばの地図｜資料と地域からたどる日本各地のことば",
  "日本各地のことばの表現・意味・記録地点・根拠資料をたどるアーカイブ。都道府県は閲覧の入口とし、資料が示す地域差と確認状態を区別します。",
  true,
);
add(
  "/prefectures",
  "47都道府県のことば",
  `${prefs.length}都道府県・${regions.length}の閲覧地域から、記録されたことばと根拠資料を探せます。地図の県境は方言境界を示しません。`,
  true,
);
add(
  "/search",
  "方言・地域のことばを検索",
  "表記・読み・意味・都道府県・記録地点から、出典と確認状態を確かめながら検索できます。",
);
for (const [path, title, description] of [
  [
    "/compare",
    "全国ことばくらべ",
    "意味ごとに地域の表現と出典を比較するための案内です。",
  ],
  [
    "/meanings",
    "一つの意味、全国のことば",
    "登録された標準語の意味を手がかりに、地域ごとの表現と資料を比較します。",
  ],
  [
    "/conversations",
    "地域の会話・文脈資料",
    "資料で確認された発話集と出典を紹介します。以前の会話例は掲載を終了しています。",
  ],
  ["/quiz", "方言クイズ", "以前のクイズの掲載終了と、出典付き記録への案内です。"],
  ["/favorites", "お気に入り", "この端末に保存したことばを振り返ります。"],
  [
    "/submit",
    "地域のことばを残す",
    "思い出したことばを端末内に保存するメモです。運営者には送信されません。",
  ],
  [
    "/editorial-policy",
    "編集方針と信頼性",
    "語形・意味・記録地域・出典の確認状態を区別し、資料の範囲を超えて一般化しない編集方針です。",
  ],
  [
    "/for-organizations",
    "自治体・教育・研究機関の方へ",
    "共同収録、地域探究、教材、展示、研究データに向けた連携方針。",
  ],
  [
    "/sustainability",
    "文化を支える仕組み",
    "基本アーカイブを公開しながら文化の記録を継続するための方針。",
  ],
  [
    "/corrections",
    "訂正・権利の申請",
    "訂正・問い合わせの連絡方法と、現在の受付状況を案内します。",
  ],
  [
    "/privacy",
    "プライバシーについて",
    "個人情報、端末保存、音声・映像の取扱方針。",
  ],
  [
    "/terms",
    "利用・投稿・権利について",
    "地域文化と話者・投稿者の権利を守るための利用・投稿方針。",
  ],
])
  add(path, title, description, path === "/editorial-policy");
for (const p of prefs) {
  const records = words.filter((d) => d.prefectureId === p.id);
  // A useful sourced collection: enough evidence to compare records, rather than an empty index.
  add(
    `/prefectures/${p.id}`,
    `${p.name}の方言・地域のことば`,
    `${p.name}の収録${records.length}語を、県内の閲覧地域・記録地点・出典とともに紹介します。県内全域での使用を意味しません。`,
    records.filter(hasCoreEvidence).length >= 5,
    [home, places],
    p.name,
  );
}
for (const r of regions) {
  const records = words.filter((d) => d.regionId === r.id);
  add(
    `/regions/${r.id}`,
    `${r.name}の方言・地域のことば（${prefName(r.prefectureId)}）`,
    `${prefName(r.prefectureId)}の閲覧区分「${r.name}」に収録された${records.length}語。個々の記録地点と出典を確認できます。区分全域への分布を示すものではありません。`,
    false,
    [
      home,
      places,
      {
        name: prefName(r.prefectureId),
        path: `/prefectures/${r.prefectureId}`,
      },
    ],
    r.name,
  );
}
for (const d of repository.archivedDialects().concat(words)) {
  if (redirects[`/dialects/${d.id}`]) continue;
  add(
    `/dialects/${d.id}`,
    `${d.phrase}の意味・使い方（${d.municipality ? d.municipality + "・" : ""}${prefName(d.prefectureId)}）`,
    `「${d.phrase}」の意味は「${d.standardJapanese}」。${d.municipality || regionName(d.regionId)}の資料・確認状態を掲載。閲覧区分は${prefName(d.prefectureId)}・${regionName(d.regionId)}です。`,
    isIndexableDialect(d),
    [
      home,
      places,
      {
        name: prefName(d.prefectureId),
        path: `/prefectures/${d.prefectureId}`,
      },
      { name: regionName(d.regionId), path: `/regions/${d.regionId}` },
    ],
    d.phrase,
  );
}
for (const m of meanings)
  add(
    `/meanings/${m.slug}`,
    m.title,
    m.description,
    m.indexStatus === "indexable" &&
      m.dialectIds.every((id) => isIndexableDialect(repository.dialect(id))),
    [home, { name: "意味から比べる", path: "/meanings" }],
    m.meaning,
  );
for (const g of guides) {
  const ds = words.filter(
    (d) =>
      prefName(d.prefectureId) === g.prefectureName &&
      (("dialectIds" in g.selector && g.selector.dialectIds?.includes(d.id)) ||
        ("prefectureWide" in g.selector &&
          g.selector.prefectureWide === true) ||
        ("municipalityPrefix" in g.selector &&
          g.selector.municipalityPrefix &&
          d.municipality?.startsWith(g.selector.municipalityPrefix))) &&
      isIndexableDialect(d),
  );
  add(
    `/guides/regions/${g.slug}`,
    g.title,
    g.description,
    g.indexStatus === "indexable" && ds.length >= 5,
    [home, places],
    g.regionLabel,
  );
}
for (const g of cultures)
  add(
    `/guides/culture/${g.slug}`,
    g.title,
    g.description,
    g.indexStatus === "indexable" &&
      g.dialectIds.length >= 3 &&
      g.dialectIds.every((id) => isIndexableDialect(repository.dialect(id))),
    [home],
    g.title.replace(/｜.+$/, ""),
  );
for (const s of stories)
  add(
    `/stories/${s.slug}`,
    s.title,
    s.description,
    s.indexStatus === "indexable" &&
      s.dialectIds.length >= 3 &&
      s.dialectIds.every((id) => isIndexableDialect(repository.dialect(id))),
    [home, { name: "地域の会話", path: "/conversations" }],
    s.title.replace(/｜.+$/, ""),
  );
for (const c of repository.conversations())
  add(
    `/conversations/${c.id}`,
    `${c.title}｜地域の会話`,
    "以前掲載していた会話例の案内です。資料で確認できることばと場面の紹介へ進めます。",
    false,
    [home, { name: "地域の会話", path: "/conversations" }],
    c.title,
  );
export const allPageMetadata = [...metadata.values()];
export function getPageMetadata(pathname: string): PageMetadata {
  let path: string;
  try {
    path = decodeURIComponent(pathname).replace(/\/$/, "") || "/";
  } catch {
    path = "/404";
  }
  return (
    metadata.get(redirects[path] || path) ?? {
      path: "/404",
      title: "ページが見つかりません｜ことばの地図",
      description:
        "指定されたページは見つかりません。地図や検索からことばを探せます。",
      indexable: false,
      breadcrumbs: [home, { name: "ページが見つかりません", path: "/404" }],
    }
  );
}
export const structuredData = (page: PageMetadata, origin: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: page.breadcrumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: origin + encodeURI(c.path),
  })),
});
