import { ArrowRight, Layers3, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { normalizeJapanese } from "./japaneseSearch";
import { repository } from "./repository";
import type { Dialect } from "./domain";
import comparisonData from "./data/meaning-comparisons.json";

const prefectureName = new Map(
  repository.prefectures().map((item) => [item.id, item.name]),
);

type MeaningGroup = { meaning: string; items: Dialect[] };
type MeaningComparisonRecord = {
  id: string;
  slug: string;
  meaning: string;
  title: string;
  description: string;
  searchIntent: string;
  dialectIds: string[];
  caution: string;
  sourceCheckedAt: string;
  indexStatus: "indexable" | "review_required" | "noindex";
};

const meaningComparisons = comparisonData as MeaningComparisonRecord[];

export function MeaningAtlas() {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => {
    const grouped = new Map<string, MeaningGroup>();
    for (const item of repository.dialects()) {
      const key = normalizeJapanese(item.standardJapanese);
      const current = grouped.get(key) ?? {
        meaning: item.standardJapanese,
        items: [],
      };
      current.items.push(item);
      grouped.set(key, current);
    }
    const normalizedQuery = normalizeJapanese(query);
    return [...grouped.values()]
      .filter(
        (group) =>
          new Set(group.items.map((item) => item.prefectureId)).size >= 2,
      )
      .filter(
        (group) =>
          !normalizedQuery ||
          normalizeJapanese(
            [
              group.meaning,
              ...group.items.flatMap((item) => [
                item.phrase,
                prefectureName.get(item.prefectureId) ?? "",
              ]),
            ].join(" "),
          ).includes(normalizedQuery),
      )
      .sort(
        (a, b) =>
          b.items.length - a.items.length ||
          a.meaning.localeCompare(b.meaning, "ja"),
      );
  }, [query]);

  return (
    <section className="meaning-atlas">
      <div className="page-head atlas-head">
        <span className="eyebrow">ONE MEANING, MANY VOICES</span>
        <h1>一つの意味、全国のことば。</h1>
        <p>
          同じ「ありがとう」でも、土地が変われば響きが変わる。標準語の意味を手がかりに、県境を越えて地域の使用例を見比べます。
        </p>
      </div>
      <label className="atlas-search">
        <Search />
        <span className="sr-only">意味やことばを検索</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="意味・方言・都道府県で絞り込む"
        />
      </label>
      <p className="result-count">
        複数地域で比較できる意味：{groups.length}件
      </p>
      <div className="meaning-editorial-links">
        {meaningComparisons.map((comparison) => (
          <Link key={comparison.id} to={`/meanings/${comparison.slug}`}>
            <strong>{comparison.meaning}</strong>
            <span>{comparison.dialectIds.length}件を比較・{comparison.indexStatus === "indexable" ? "出典確認済み" : "根拠確認中"}</span>
            <ArrowRight />
          </Link>
        ))}
      </div>
      <div className="meaning-groups">
        {groups.map((group, groupIndex) => (
          <article key={normalizeJapanese(group.meaning)}>
            <div className="meaning-group-head">
              <small>{String(groupIndex + 1).padStart(2, "0")} / MEANING</small>
              <h2>「{group.meaning}」</h2>
              <span>
                {new Set(group.items.map((item) => item.prefectureId)).size}地域
              </span>
            </div>
            <div className="meaning-entries">
              {group.items.map((item) => (
                <Link to={`/dialects/${item.id}`} key={item.id}>
                  <small>{prefectureName.get(item.prefectureId)}</small>
                  <strong>{item.phrase}</strong>
                  <span>{item.reading}</span>
                  <i className={`verification ${item.verificationStatus}`}>
                    {item.verificationStatus === "needs_review"
                      ? "要確認候補"
                      : "デモ使用例"}
                  </i>
                  <ArrowRight />
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
      {!groups.length && (
        <div className="empty compact">
          <Layers3 />
          <h2>比較できる組み合わせはありません</h2>
          <p>別の意味や地域名で探してみてください。</p>
        </div>
      )}
      <div className="notice">
        同じ標準語訳でも、ニュアンスや使える場面が一致するとは限りません。各記録の地域・世代・確認状態をあわせてご覧ください。
      </div>
    </section>
  );
}

export function MeaningComparison() {
  const { slug } = useParams();
  const comparison = meaningComparisons.find((item) => item.slug === slug);
  if (!comparison) return <Navigate to="/meanings" replace />;
  const items = comparison.dialectIds
    .map((id) => repository.dialect(id))
    .filter((item): item is Dialect => Boolean(item));

  return (
    <article className="meaning-atlas meaning-comparison-detail">
      <nav className="breadcrumbs" aria-label="パンくず">
        <Link to="/">ホーム</Link><span>/</span>
        <Link to="/meanings">意味から比べる</Link><span>/</span>
        <span>{comparison.meaning}</span>
      </nav>
      <header className="page-head atlas-head">
        <span className="eyebrow">{comparison.indexStatus === "indexable" ? "VERIFIED MEANING COMPARISON" : "REVIEW REQUIRED"}</span>
        <h1>{comparison.title.replace(/｜.+$/, "")}</h1>
        <p>{comparison.description}</p>
      </header>
      {comparison.indexStatus !== "indexable" && (
        <div className="notice"><strong>確認待ち比較</strong><p>参照する語の一部に、出典または用例の確認が不足しています。このページは検索対象にせず、候補比較として表示しています。</p></div>
      )}
      <section className="comparison-intent">
        <h2>このページで分かること</h2>
        <p>{comparison.searchIntent}</p>
      </section>
      <section>
        <h2>地域ごとの言い方と実例</h2>
        <div className="meaning-entries comparison-cards">
          {items.map((item) => (
            <Link to={`/dialects/${item.id}`} key={item.id}>
              <small>{prefectureName.get(item.prefectureId)}</small>
              <strong>{item.phrase}</strong>
              <span>{item.reading}／{item.standardJapanese}</span>
              <p>{item.exampleDialect}</p>
              <p className="translation">{item.exampleStandard}</p>
              <i className={`verification ${item.verificationStatus}`}>参照確認</i>
              <ArrowRight />
            </Link>
          ))}
        </div>
      </section>
      <aside className="notice">
        <strong>比較するときの注意</strong>
        <p>{comparison.caution}</p>
      </aside>
      <footer className="comparison-source-note">
        各語の根拠資料は個別記事に掲載しています。比較データ最終確認日：{comparison.sourceCheckedAt}
      </footer>
    </article>
  );
}
