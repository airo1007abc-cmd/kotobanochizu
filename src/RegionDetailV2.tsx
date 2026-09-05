import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Home,
  MapPin,
  Search,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PrefectureLocatorMap } from "./PrefectureDetailV2";
import { RegionalCultureSection } from "./RegionalCultureSection";
import type { RegionDetailViewModel } from "./regionDetailViewModel";

export function RegionDetailV2({ vm }: { vm: RegionDetailViewModel }) {
  return (
    <article
      className="region-v2"
      data-region-detail-version={import.meta.env.DEV ? "v2" : undefined}
    >
      <nav className="prefecture-v2-breadcrumb" aria-label="パンくず">
        <Link to="/">
          <Home />
          ホーム
        </Link>
        <span>/</span>
        <Link to="/prefectures">地域を探す</Link>
        <span>/</span>
        <Link to={`/prefectures/${vm.prefecture.id}`}>
          {vm.prefecture.name}
        </Link>
        <span>/</span>
        <span>{vm.name}</span>
      </nav>
      <header className="region-v2-hero">
        <div>
          <span className="eyebrow">
            {vm.prefecture.area}・{vm.prefecture.name}の地域
          </span>
          <h1>{vm.name}のことば</h1>
          <p>
            {vm.description ??
              `${vm.prefecture.name}の現在のアーカイブ区分「${vm.name}」に記録されたことばを紹介します。`}
          </p>
          <div className="prefecture-v2-stats">
            <div>
              <strong>{vm.dialectCount}</strong>
              <span>収録語</span>
            </div>
            <div>
              <strong>{vm.confirmedCount}</strong>
              <span>参照確認</span>
            </div>
            <div>
              <strong>{vm.sourcedCount}</strong>
              <span>出典あり</span>
            </div>
          </div>
          {vm.languageVarieties.length > 0 && (
            <p className="prefecture-v2-varieties">
              収録データの言語区分：
              {vm.languageVarieties.map((item) => item.label).join("、")}
            </p>
          )}
        </div>
        <aside className="prefecture-v2-locator">
          <PrefectureLocatorMap prefectureName={vm.prefecture.name} />
          <p>
            <MapPin />
            {vm.prefecture.name}に属する「{vm.name}」
          </p>
          <small>
            地域境界の正確なpolygonデータがないため、県の位置のみ表示しています。
          </small>
        </aside>
      </header>

      {vm.hasWords ? (
        <section className="region-v2-featured">
          <div className="prefecture-v2-section-head compact">
            <div>
              <span className="eyebrow">記録の入口</span>
              <h2>この地域のことばを一部紹介</h2>
            </div>
            <Link to={vm.searchTarget}>
              全{vm.dialectCount}語を見る <ArrowRight />
            </Link>
          </div>
          <div className="prefecture-v2-word-grid">
            {vm.featuredWords.map((item) => (
              <Link to={`/dialects/${item.id}`} key={item.id}>
                <div>
                  <span>{item.municipality ?? vm.name}</span>
                  <small>
                    <CheckCircle2 />
                    {item.verificationLabel}
                  </small>
                </div>
                <h3>{item.word}</h3>
                {item.reading && item.reading !== item.word && (
                  <p className="prefecture-v2-reading">［{item.reading}］</p>
                )}
                <p>{item.meaning}</p>
                <ArrowRight />
              </Link>
            ))}
          </div>
          <Link className="prefecture-v2-all-link" to={vm.searchTarget}>
            <Search />
            <span>
              <strong>{vm.name}のことばをすべて見る</strong>
              <small>
                {vm.prefecture.name}・{vm.name}の条件で絞り込みます
              </small>
            </span>
            <ArrowRight />
          </Link>
        </section>
      ) : (
        <section className="region-v2-empty">
          <span className="eyebrow">ARCHIVE STATUS</span>
          <h2>収録準備中</h2>
          <p>
            この地域区分には、現在公開できることばの記録がありません。県内のほかの地域から探索できます。
          </p>
          <Link to={`/prefectures/${vm.prefecture.id}`}>
            {vm.prefecture.name}へ戻る <ArrowRight />
          </Link>
        </section>
      )}

      {(vm.hasLocations ||
        vm.languageVarieties.length > 0 ||
        vm.hasSources) && (
        <section className="region-v2-record">
          <div>
            <span className="eyebrow">REGION RECORD</span>
            <h2>この地域についての記録</h2>
          </div>
          <div className="region-v2-record-grid">
            {vm.hasLocations && (
              <div>
                <strong>記録地点</strong>
                <p>{vm.municipalities.join("、")}</p>
              </div>
            )}
            <div>
              <strong>資料上の分類</strong>
              <p>{vm.languageVarieties.map((item) => item.label).join("、")}</p>
            </div>
            <div>
              <strong>確認状況</strong>
              <p>
                {vm.sourcedCount}語に出典情報、{vm.confirmedCount}
                語に参照確認があります。
              </p>
            </div>
          </div>
        </section>
      )}

      <RegionalCultureSection
        title={`${vm.name}のことばと文化`}
        items={vm.cultureItems}
      />
      <section className="region-v2-siblings">
        <div className="prefecture-v2-section-head compact">
          <div>
            <span className="eyebrow">同じ県をたどる</span>
            <h2>{vm.prefecture.name}のほかの地域</h2>
          </div>
          <Link to={`/prefectures/${vm.prefecture.id}`}>
            {vm.prefecture.name}ページへ <ArrowRight />
          </Link>
        </div>
        <nav aria-label={`${vm.prefecture.name}の地域`}>
          {vm.siblingRegions
            .filter((item) => !item.current)
            .map((item) => (
              <Link to={`/regions/${item.id}`} key={item.id}>
                {item.name}
                <ArrowRight />
              </Link>
            ))}
        </nav>
      </section>
      <section className="region-v2-contribute">
        <BookOpen />
        <div>
          <h2>この地域のことばを記録・確認しています</h2>
          <p>
            地域での使い方や資料情報をお持ちの方からの情報を募集しています。
          </p>
        </div>
        <Link to="/submit">
          情報を送る <Send />
        </Link>
      </section>
    </article>
  );
}
